/*

  This function mergeArraysByProperty takes two arrays, arr1 and arr2, and a property name as arguments. It merges the arrays based on the specified property and returns the merged array. In the example provided, it merges objects with the same "id" property.
  
  // Example usage:
  const array1 = [
    { id: 1, name: "John" },
    { id: 2, name: "Alice" },
  ];
  const array2 = [
    { id: 1, age: 30 },
    { id: 3, age: 25 },
  ];
  
  const mergedArray = mergeArraysByProperty(array1, array2, "id");

*/

export function mergeArraysOn<T>(arr1: T[], arr2: T[], property: keyof T): T[] {
  const map = new Map<any, T>();

  arr1.forEach((obj) => map.set(obj[property], obj));

  arr2.forEach((obj) => {
    const key = obj[property];
    if (map.has(key)) {
      Object.assign(map.get(key), obj);
    } else {
      arr1.push(obj);
    }
  });

  return arr1;
}
