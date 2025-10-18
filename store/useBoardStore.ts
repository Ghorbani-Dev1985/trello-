'use client'
import { create } from 'zustand'
import { nanoid } from 'nanoid'

export type CardItem = { id: string, title: string }
export type ColumnItem = { id: string, title: string, cardIds: string[] }
export type BoardSnapshot = { columns: Record<string, ColumnItem>, cards: Record<string, CardItem> }

type State = {
  history: BoardSnapshot[],
  idx: number,
  getSnapshot: () => BoardSnapshot,
  apply: (next: BoardSnapshot) => void,
  undo: () => void,
  redo: () => void,
  reset: () => void,
  addCard: (colId: string, title: string) => void,
  editCard: (cardId: string, title: string) => void,
  deleteCard: (cardId: string) => void,
  addColumn: (title: string) => void,
  editColumn: (colId: string, title: string) => void,
  deleteColumn: (colId: string) => void,
  moveCard: (cardId: string, fromColId: string, toColId: string, newIndex?: number) => void,
  canUndo: boolean,
  canRedo: boolean
}

const STORAGE_KEY = 'trello_board_v2'

const initial: BoardSnapshot = {
  columns: {
    'col-1': { id: 'col-1', title: 'To Do', cardIds: ['card-1', 'card-2'] },
    'col-2': { id: 'col-2', title: 'In Progress', cardIds: ['card-3'] },
    'col-3': { id: 'col-3', title: 'Done', cardIds: ['card-4'] }
  },
  cards: {
    'card-1': { id: 'card-1', title: 'Tutorial CRUD' },
    'card-2': { id: 'card-2', title: 'Design mockups' },
    'card-3': { id: 'card-3', title: 'Client-side validation' },
    'card-4': { id: 'card-4', title: 'Release v1.0' }
  }
}

const load = (): { history: BoardSnapshot[], idx: number } => {
  try {
    if (typeof window === 'undefined') {
      return { history: [initial], idx: 0 }
    }
    
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { history: [initial], idx: 0 }
    
    const parsed = JSON.parse(raw)
    if (parsed?.history?.length > 0 && typeof parsed?.idx === 'number') {
      return parsed
    }
    return { history: [initial], idx: 0 }
  } catch {
    return { history: [initial], idx: 0 }
  }
}

const save = (history: BoardSnapshot[], idx: number) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ history, idx }))
    }
  } catch (error) {
    console.error('Failed to save board state:', error)
  }
}

const useBoardStore = create<State>((set, get) => {
  // Initialize state from localStorage
  const stored = load()

  const getSnapshot = (): BoardSnapshot => {
    const state = get()
    return state.history[state.idx]
  }

  const apply = (next: BoardSnapshot) => {
    const state = get()
    const { history, idx } = state
    
    // Remove future history if we're not at the latest state
    const newHistory = history.slice(0, idx + 1)
    newHistory.push(next)
    
    // Limit history size to prevent memory issues
    const MAX_HISTORY = 50
    const trimmedHistory = newHistory.length > MAX_HISTORY 
      ? newHistory.slice(newHistory.length - MAX_HISTORY)
      : newHistory
    
    const newIdx = Math.min(idx + 1, MAX_HISTORY - 1)
    
    set({ 
      history: trimmedHistory, 
      idx: newIdx 
    })
    save(trimmedHistory, newIdx)
  }

  const undo = () => {
    const state = get()
    const { idx, history } = state
    if (idx > 0) {
      const newIdx = idx - 1
      set({ idx: newIdx })
      save(history, newIdx)
    }
  }

  const redo = () => {
    const state = get()
    const { idx, history } = state
    if (idx < history.length - 1) {
      const newIdx = idx + 1
      set({ idx: newIdx })
      save(history, newIdx)
    }
  }

  const reset = () => {
    set({ history: [initial], idx: 0 })
    save([initial], 0)
  }

  const addCard = (colId: string, title: string) => {
    const snap = getSnapshot()
    if (!snap.columns[colId]) return
    
    const cardId = `card-${nanoid(8)}`
    const next: BoardSnapshot = {
      columns: { ...snap.columns },
      cards: { ...snap.cards }
    }
    
    next.cards[cardId] = { id: cardId, title }
    next.columns[colId] = {
      ...next.columns[colId],
      cardIds: [...next.columns[colId].cardIds, cardId]
    }
    
    apply(next)
  }

const editCard = (cardId: string, title: string) => {
  const snap = getSnapshot()
  if (!snap.cards[cardId]) return

  const next: BoardSnapshot = structuredClone(snap)
  next.cards[cardId].title = title
  apply(next)
}


const deleteCard = (cardId: string) => {
  const snap = getSnapshot()
  if (!snap.cards[cardId]) return

  const next: BoardSnapshot = structuredClone(snap) 

  delete next.cards[cardId]

  Object.keys(next.columns).forEach(colId => {
    next.columns[colId].cardIds = next.columns[colId].cardIds.filter(id => id !== cardId)
  })

  apply(next)
}

  const addColumn = (title: string) => {
    const snap = getSnapshot()
    const colId = `col-${nanoid(8)}`
    
    const next: BoardSnapshot = {
      columns: { ...snap.columns },
      cards: { ...snap.cards }
    }
    
    next.columns[colId] = { id: colId, title, cardIds: [] }
    apply(next)
  }

  const editColumn = (colId: string, title: string) => {
    const snap = getSnapshot()
    if (!snap.columns[colId]) return
    
    const next: BoardSnapshot = {
      columns: { ...snap.columns },
      cards: { ...snap.cards }
    }
    
    next.columns[colId] = { ...next.columns[colId], title }
    apply(next)
  }

  const deleteColumn = (colId: string) => {
    const snap = getSnapshot()
    if (!snap.columns[colId]) return
    
    const next: BoardSnapshot = {
      columns: { ...snap.columns },
      cards: { ...snap.cards }
    }
    
    // Remove cards that only exist in this column
    const cardsToRemove = next.columns[colId].cardIds
    const cardUsage: Record<string, number> = {}
    
    // Count card usage across all columns
    Object.values(next.columns).forEach(col => {
      col.cardIds.forEach(cardId => {
        cardUsage[cardId] = (cardUsage[cardId] || 0) + 1
      })
    })
    
    // Remove cards that are only used in the deleted column
    cardsToRemove.forEach(cardId => {
      if (cardUsage[cardId] === 1) {
        delete next.cards[cardId]
      }
    })
    
    delete next.columns[colId]
    apply(next)
  }

  const moveCard = (cardId: string, fromColId: string, toColId: string, newIndex?: number) => {
    const snap = getSnapshot()
    if (!snap.columns[fromColId] || !snap.columns[toColId] || !snap.cards[cardId]) return
    
    const next: BoardSnapshot = {
      columns: { ...snap.columns },
      cards: { ...snap.cards }
    }
    
    // Remove from source column
    next.columns[fromColId] = {
      ...next.columns[fromColId],
      cardIds: next.columns[fromColId].cardIds.filter(id => id !== cardId)
    }
    
    // Add to target column
    const targetCardIds = [...next.columns[toColId].cardIds]
    if (typeof newIndex === 'number' && newIndex >= 0 && newIndex <= targetCardIds.length) {
      targetCardIds.splice(newIndex, 0, cardId)
    } else {
      targetCardIds.push(cardId)
    }
    
    next.columns[toColId] = {
      ...next.columns[toColId],
      cardIds: targetCardIds
    }
    
    apply(next)
  }

  return {
    history: stored.history,
    idx: stored.idx,
    getSnapshot,
    apply,
    undo,
    redo,
    reset,
    addCard,
    editCard,
    deleteCard,
    addColumn,
    editColumn,
    deleteColumn,
    moveCard,
    get canUndo() {
      return get().idx > 0
    },
    get canRedo() {
      const state = get()
      return state.idx < state.history.length - 1
    }
  }
})

export default useBoardStore