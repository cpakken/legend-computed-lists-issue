import { beginBatch, endBatch, observable, type Observable } from '@legendapp/state'
import { weakMemo } from './weak-memo'

const getNumFromId = (id?: string) => (id ? parseInt(id.split('_')[1]) : 0)

export const getRandomNum = () => Math.floor(Math.random() * 10 ** 5)

const createItemEntry = (id: number) =>
  [`ID_${id}`, { id: `ID_${id}`, value: getRandomNum() }] as const

export const state$ = observable({
  items: Object.fromEntries(Array.from({ length: 5 }, (_, i) => createItemEntry(i + 1))),
  itemList: () => Object.values(state$.items),
  itemDerivedList: () => state$.itemList.map(itemMapper),

  //!NOTE When items are deleted (from first in list), the fitlered result is wrong. Index are wrong
  filteredList: () => state$.itemList.filter((item) => item.value.get() > 40000),

  //!IF DELETED ITEMS ORDERED FIRST IN LIST, THEN TOGGLE RANDOMIZE TO SEE SORTED (TAB WILL FREEZE)
  sortedList: () => [...state$.itemList].sort((a, b) => a.value.get() - b.value.get()),
  // sortedList: () => Object.values(state$.items).sort((a, b) => a.value.get() - b.value.get()),
})

const itemMapper = weakMemo(({ id, value }: Observable<{ id: string; value: number }>) => {
  console.log('SHOULD BE MEMOIZED AND CREATED ONCE', id.get())
  return { value: () => id.get() + '_' + value.get() }
})

//@ts-ignore
globalThis.$ = state$

export const addItem = () => {
  const itemList = Object.values(state$.items)
  const newId = ((itemList.length && getNumFromId(itemList[itemList.length - 1].id.get())) || 0) + 1
  const [id, item] = createItemEntry(newId)
  state$.items[id].set(item)
}

export const deleteItem = () => {
  //Removes the first item in the list
  const itemList = Object.values(state$.items)

  //Seems like if removing the last item, the INDEXIES don't change and are fine...
  //DELETING ITEMS IN Object.values() don't update indexies

  // const itemId = itemList[itemList.length - 1]?.id.get() //The last item of the list
  const itemId = itemList[0]?.id.get() //The first item of the list

  if (itemId) {
    console.log('REMOVING', itemId)
    state$.items[itemId].delete()
  }
}

//NEEDS TO BE BATCHED
export const removeItemPeek = action(() => {
  deleteItem()
  //The peek() and get() seems to update the indexies...
  state$.itemList.peek() //! NEED TO PEEK() WITHIN BATCH (action) ( can be .peek() or get())

  // state$.itemDerivedList.peek() //Doesn't matter
})

export function action<T extends (...args: any[]) => any>(fn: T): T {
  return ((...args) => {
    beginBatch()
    const ret = fn(...args)
    endBatch()
    return ret
  }) as T
}
