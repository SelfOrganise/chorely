interface Grocery {
  id: number;
  name: string;
  size: number;
}

interface User {
  id: number;
}

interface Assignment {
  id: number;
  title: string;
  task_id: number;
  assigned_to_user_id: number;
  assigned_by_user_id: number | null;
  due_by_utc: string | null;
  assigned_at_utc: string;
  subtasks: string[] | null;
}

interface Basket {
  id: number;
  created_at_utc: string;
  items: Array<BasketItem>;
}

interface BasketItem extends Grocery {
  basketId: number;
}

interface MapData {
  id: number;
  data: string;
}

interface Recipe {
  id: number;
  name: string;
  created_at_utc: string;
  groceries: Array<Grocery>;
}


