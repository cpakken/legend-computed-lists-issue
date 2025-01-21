import type { Observable } from '@legendapp/state'
import { For, Memo, observer, use$ } from '@legendapp/state/react'
import { action, addItem, deleteItem, getRandomNum, removeItemPeek, state$ } from './state'

export const App = () => {
  console.log('App render')

  return (
    <div className="font-mono p-4 flex flex-col gap-4">
      <div className="flex gap-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
          onClick={addItem}
        >
          ADD ITEM
        </button>
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
          onClick={deleteItem}
        >
          DELETE ITEM
        </button>
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
          onClick={removeItemPeek}
        >
          DELETE ITEM WITH .PEEK() AFTER
        </button>
      </div>
      <div className="flex gap-10 whitespace-pre-wrap">
        <div>
          <div>ITEMS:</div>
          <Memo>{() => JSON.stringify(state$.items.get(), null, 2)}</Memo>
          <div>KEYS:</div>
          <Memo>{() => JSON.stringify(Object.keys(state$.items), null, 2)}</Memo>
        </div>
        <div>
          <div>ITEM LIST:</div>
          <div>
            <For each={state$.itemList}>{(item$) => <ItemJSON item$={item$} />}</For>
          </div>
        </div>
        <div>
          <div>ITEM LIST UI:</div>
          <div className="flex flex-col gap-4">
            <For each={state$.itemList}>{(item$) => <Item item$={item$} />}</For>
          </div>
        </div>
        <div>
          <div>DERIVED ITEMS:</div>
          <div>
            <Memo>{() => 'LENGTH: ' + state$.itemDerivedList.length}</Memo>
          </div>
          <div>
            <For each={state$.itemDerivedList}>
              {(item) => (
                <div>
                  <Memo>{() => item.value.get()}</Memo>
                </div>
              )}
            </For>
          </div>
        </div>
        <div>
          <div>FILTERED LIST:</div>
          <div>
            <For each={state$.filteredList}>{(item) => <ItemJSON item$={item} />}</For>
          </div>
        </div>
        <div>
          <div>SORTED LIST:</div>
          <div className="max-w-[250px]">
            <div>
              IF DELETED ITEMS ORDERED FIRST IN LIST, THEN TOGGLE RANDOMIZE TO SEE SORTED (TAB WILL
              FREEZE)
            </div>
            <div>UNCOMMENT TO SEE SORTED LIST</div>
            {/* <For optimized each={state$.sortedList}>
              {(item) => (
                <div>
                  <Memo>{() => JSON.stringify(item.get(), null, 2)}</Memo>
                </div>
              )}
            </For> */}
          </div>
        </div>
      </div>
    </div>
  )
}

const ItemJSON = ({ item$ }: { item$: Observable<{ id: string; value: number }> }) => {
  return (
    <div>
      <Memo>{() => JSON.stringify(item$.get(), null, 2)}</Memo>
    </div>
  )
}

const Item = observer(({ item$ }: { item$: Observable<{ id: string; value: number }> }) => {
  const { id, value } = item$

  return (
    <div className="border border-gray-500 p-1 rounded select-none flex flex-col">
      <div className="flex justify-between">
        <div>{use$(id)}</div>
        <div>{use$(value)}</div>
      </div>
      <button
        className="cursor-pointer font-bold text-blue-500 hover:text-blue-400"
        onClick={() => value.set(getRandomNum())}
      >
        RANDOMIZE
      </button>
      <button
        className="cursor-pointer text-red-500 hover:text-red-400"
        onClick={() => item$.delete()}
      >
        DELETE
      </button>
      <button
        className="cursor-pointer text-red-500 hover:text-red-400"
        onClick={action(() => {
          item$.delete()
          state$.itemList.peek()
        })}
      >
        DELETE W/ .PEEK()
      </button>
    </div>
  )
})
