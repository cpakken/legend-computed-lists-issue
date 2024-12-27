import { beginBatch, endBatch, observable } from '@legendapp/state'
import { For, Memo } from '@legendapp/state/react'

function numToChar(num: number): string {
  // ASCII value of 'a' is 97
  return String.fromCharCode(96 + num)
}

function action<T extends (...args: any[]) => any>(fn: T): T {
  return ((...args) => {
    beginBatch()
    const ret = fn(...args)
    endBatch()
    return ret
  }) as T
}

const $ = observable({
  list: [1, 2, 3, 4].map((value) => ({ value })),
  mapped: () => $.list.map((item) => ({ item })),

  store: Object.fromEntries([1, 2, 3, 4].map((value) => [numToChar(value), { value }])),
  storeList: () => Object.values($.store),
})

export const App = () => {
  // const add = () => $.list.push({ value: $.list.length + 1 })
  const add = action(() => {
    $.list.splice(1, 0, { value: $.list.length + 1 })

    $.store[numToChar($.list.length + 1)].set({ value: $.list.length + 1 })
  })

  const remove = action(() => {
    $.list[1].delete()

    $.store[numToChar($.list.length)].delete()
  })

  return (
    <div className="font-mono p-4 flex flex-col gap-4">
      <div className="flex gap-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline"
          onClick={add}
        >
          ADD
        </button>
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded inline"
          onClick={remove}
        >
          REMOVE
        </button>
      </div>
      <div className="flex gap-4">
        <div>
          <For optimized each={$.list}>
            {(item) => <div>{JSON.stringify(item.get())}</div>}
          </For>
        </div>
        <div>
          <For optimized each={$.mapped}>
            {(item) => <div>{JSON.stringify(item.get())}</div>}
          </For>
        </div>
        <div className="whitespace-pre">
          <Memo>{() => JSON.stringify($.store.get(), null, 2)}</Memo>
        </div>
        <div>
          <For optimized each={$.storeList}>
            {(item) => <div>{JSON.stringify(item.get())}</div>}
          </For>
        </div>
      </div>
    </div>
  )
}
