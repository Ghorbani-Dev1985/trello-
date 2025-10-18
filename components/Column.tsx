"use client";
import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Card from "./Card";
import useBoardStore from "../store/useBoardStore";
import { PlusCircleIcon, TrashIcon } from "@heroicons/react/20/solid";
import { Input } from "@heroui/input";

import TrelloModal from "./TrelloModal";

export default function Column({
  column,
  cards,
}: {
  column: { id: string; title: string; cardIds: string[] };
  cards: any[];
}) {
  const { setNodeRef } = useDroppable({ id: column.id });
  const { addCard, deleteColumn } = useBoardStore();

  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      addCard(column.id, newCardTitle.trim());
      setNewCardTitle("");
      setAddModalOpen(false);
    }
  };

  const handleDeleteColumn = () => {
    deleteColumn(column.id);
    setDeleteModalOpen(false);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md border border-gray-200 flex flex-col"
      ref={setNodeRef}
    >
      {/* Header */}
      <div className="bg-primary/10 flex justify-between items-center px-3 py-2 rounded-t-md">
        <h3 className="text-lg font-semibold text-gray-800">{column.title}</h3>
        <div className="flex gap-2">
          <button aria-label="Add Card" onClick={() => setAddModalOpen(true)}>
            <PlusCircleIcon className="text-emerald-500 hover:text-emerald-400 size-6" />
          </button>
          <button
            aria-label="Delete Column"
            onClick={() => setDeleteModalOpen(true)}
          >
            <TrashIcon className="text-rose-500 hover:text-rose-400 size-6" />
          </button>
        </div>
      </div>

      {/* Cards */}
      <SortableContext
        items={cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2 min-h-[40px] p-2">
          {cards.map((card, idx) => (
            <Card key={card.id} card={card} index={idx} columnId={column.id} />
          ))}
        </div>
      </SortableContext>

      {/* Add Card Modal */}
      <TrelloModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Card"
        confirmLabel="Add New"
        onConfirm={handleAddCard}
        disableConfirm={!newCardTitle.trim()}
      >
        <Input
          label="Card Name"
          placeholder="Please enter new card name"
          value={newCardTitle}
          onChange={(e) => setNewCardTitle(e.target.value)}
          autoFocus
        />
        <p className="text-sm text-gray-500 mt-2">
          Adding to: <strong>{column.title}</strong>
        </p>
      </TrelloModal>

      {/* Delete Confirmation Modal */}
      <TrelloModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Column"
        confirmLabel="Delete Column"
        confirmColor="danger"
        onConfirm={handleDeleteColumn}
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <TrashIcon className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Delete Column
          </h3>
          <p className="text-sm text-gray-500">
            Are you sure you want to delete the column "<strong>{column.title}</strong>"?
          </p>
        </div>
      </TrelloModal>
    </div>
  );
}