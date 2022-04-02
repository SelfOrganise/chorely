declare global {
  interface DbUser {
    id: number;
    name: string;
    email: string;
    created_at_utc: string;
    is_admin: boolean;
    rota_order: number;
    organisation_id: number;
  }

  interface DbTask {
    id: number;
    title: string;
    frequency: number | null;
    preferred_time: numer | null;
    organisation_id: number;
    subtasks: string[] | null;
  }

  interface DbAssignment {
    id: number;
    task_id: number;
    assigned_to_user_id: number;
    assigned_by_user_id: number | null;
    due_by_utc: string | null;
    assigned_at_utc: string;
  }

  interface DbExemption {
    id: number;
    task_id: number;
    user_id: number;
    created_at_utc: string;
  }

  interface DbGrocery {
    id: number;
    name: string;
    size: 1 | 2 | 3;
    organisation_id: number;
    created_at_utc: string;
  }

  interface DbBasket {
    id: number;
    organisation_id: number;
    create_at_utc: string;
  }

  interface DbBasketItem {
    id: number;
    basket_id: number;
    grocery_id: number;
  }

  interface DbMapData {
    id: number;
    data: string;
    organisation_id: number;
  }

  interface DbRecipe {
    id: number;
    name: string;
    created_at_utc: string;
    organisation_id: number;
  }

  interface DbRecipeIngredient {
    recipe_id: number;
    grocery_id: number;
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    user: DbUser;
  }
}
