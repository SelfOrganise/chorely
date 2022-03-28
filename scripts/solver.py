#!/usr/bin/env python

from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp

import sys
import json
import math

def parse_args():
    distance_matrix = json.loads(sys.argv[1])
    sizes = json.loads(sys.argv[2])
    num_vehicles = json.loads(sys.argv[3])
    total_size = sum(sizes)
    size_per_vehicle = math.ceil(total_size / num_vehicles)

    data = {}
    data['distance_matrix'] = distance_matrix
    data['num_vehicles'] = num_vehicles
    data['sizes'] = sizes
    data['sizes_per_vehicle'] = [size_per_vehicle] * num_vehicles
    data['starts'] = [0] * num_vehicles
    data['ends'] = [len(distance_matrix) - 1] * num_vehicles

    return data


def format_solution(data, manager, routing, solution):
    result = []
    for vehicle_id in range(data['num_vehicles']):
        index = routing.Start(vehicle_id)
        route_distance = 0
        route = []
        while not routing.IsEnd(index):
            route.append(manager.IndexToNode(index))
            previous_index = index
            index = solution.Value(routing.NextVar(index))
            route_distance += routing.GetArcCostForVehicle(
                previous_index, index, vehicle_id)
        route.append(manager.IndexToNode(index))
        result.append(route)

    return result

def solve():
    """Entry point of the program."""
    # Instantiate the data problem.
    data = parse_args()

    # Create the routing index manager.
    manager = pywrapcp.RoutingIndexManager(len(data['distance_matrix']),
                                           data['num_vehicles'], data['starts'],
                                           data['ends'])

    # Create Routing Model.
    routing = pywrapcp.RoutingModel(manager)

    # Create and register a transit callback.
    def distance_callback(from_index, to_index):
        """Returns the distance between the two nodes."""
        # Convert from routing variable Index to distance matrix NodeIndex.
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return data['distance_matrix'][from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)

    def demand_callback(from_index):
        """Returns the demand of the node."""
        # Convert from routing variable Index to demands NodeIndex.
        from_node = manager.IndexToNode(from_index)
        return data['sizes'][from_node]

    demand_callback_index = routing.RegisterUnaryTransitCallback(
        demand_callback)
    routing.AddDimensionWithVehicleCapacity(
        demand_callback_index,
        0,  # null capacity slack
        data['sizes_per_vehicle'],  # vehicle maximum capacities
        True,  # start cumul to zero
        'Capacity')

    # Define cost of each arc.
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    # Add Distance constraint.
    dimension_name = 'Distance'
    routing.AddDimension(
        transit_callback_index,
        10,  # no slack
        3000,  # vehicle maximum travel distance
        True,  # start cumul to zero
        dimension_name)
    distance_dimension = routing.GetDimensionOrDie(dimension_name)
    distance_dimension.SetGlobalSpanCostCoefficient(100)


    # Setting first solution heuristic.
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC)

    # Solve the problem.
    solution = routing.SolveWithParameters(search_parameters)

    # Print solution on console.
    if solution:
        return format_solution(data, manager, routing, solution)
    else:
        raise Exception('Cannot solve')


if __name__ == '__main__':
    try:
        print(json.dumps(solve()))
    except Exception as ex:
        sys.stderr.write(json.dumps(str(ex)))
