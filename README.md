- Deleting items in a store `Observable<Record<string, Item>>` does not update derived lists `() => Object.values(state$.items)` correctly.
- Deleting items from based on last item in list seems to work, but deleting items out of order (especially the first item) does not work.
  - Seems like the computed list indexies are not updated correctly on origin item.delete(). 
  - if item.delete() is called in a batch with itemList.peek() (or itemList.get()) afterwords, it fixes SOME issues.

- Should work without .peek() or .get() on the computed list 

```ts
const getNumFromId = (id?: string) => (id ? parseInt(id.split('_')[1]) : 0)

export const getRandomNum = () => Math.floor(Math.random() * 10 ** 5)

const createItemEntry = (id: number) =>
  [`ID_${id}`, { id: `ID_${id}`, value: getRandomNum() }] as const

export const state$ = observable({
  //Items Store
  items: Object.fromEntries(Array.from({ length: 5 }, (_, i) => createItemEntry(i + 1))),
  /*
  items : { 
    'ID_1': { id: 'ID_1', value: 12345 },
    'ID_2': { id: 'ID_2', value: 12345 },
    'ID_3': { id: 'ID_3', value: 12345 },
    'ID_4': { id: 'ID_4', value: 12345 },
    'ID_5': { id: 'ID_5', value: 12345 } 
    }
  */

  //Item List
  itemList: () => Object.values(state$.items),
  /*
  itemList : [
    { id: 'ID_1', value: 12345 },
    { id: 'ID_2', value: 12345 },
    { id: 'ID_3', value: 12345 },
    { id: 'ID_4', value: 12345 },
    { id: 'ID_5', value: 12345 } 
  ]
  */

  //Derived List
  itemDerivedList: () => state$.itemList.map(itemMapper),
  /*
  itemDerivedList : [
    { value: 'ID_1_12345' },
    { value: 'ID_2_12345' },
    { value: 'ID_3_12345' },
    { value: 'ID_4_12345' },
    { value: 'ID_5_12345' } 
  ]
  */


  //!NOTE When items are deleted (from first in list), the fitlered result is wrong. Index are wrong
  filteredList: () => state$.itemList.filter((item) => item.value.get() > 40000),

  //IF DELETED ITEMS ORDERED FIRST IN LIST, THEN TOGGLE RANDOMIZE TO SEE SORTED (TAB WILL FREEZE)
   sortedList: () => $.itemList.sort((a, b) => a.value - b.value)


})

const itemMapper = weakMemo(({ id, value }: Observable<{ id: string; value: number }>) => {
  console.log('SHOULD BE MEMOIZED AND CREATED ONCE', id.get())
  return { value: () => id.get() + '_' + value.get() }
})

```