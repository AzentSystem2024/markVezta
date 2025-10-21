import { EventEmitter } from '@angular/core';

// Create a shared EventEmitter that can be imported in other components
export const storeDataUpdatedEvent = new EventEmitter<number[]>();