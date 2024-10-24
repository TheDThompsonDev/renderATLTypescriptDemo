export interface ModalClosed {
    state: "closed";
  }
  
  export interface ModalOpen {
    state: "open";
    foodItem: string;
    calorieCount: number | null;
  }
  
  export type ModalState = ModalClosed | ModalOpen;
  export type PartialModalState = Partial<ModalState>;
/*This is a Discriminated Union!
A discriminated union is a pattern in TypeScript that combines union types with 
discriminant properties to 
enable type-safe differentiation between different variants of the union. 
It is particularly useful for modeling 
situations where an entity can be in one of several distinct states, 
each with different properties.
  
Both ModalClosed and ModalOpen interfaces have a common property state which acts 
as the discriminant.
The value of state is a string literal that uniquely identifies the variant 
("closed" for ModalClosed and "open" for ModalOpen).

ModalState is the union type that can be either a ModalClosed or a ModalOpen.*/
