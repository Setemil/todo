"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/server/firebase";
import { useRouter } from "next/navigation";
import { Loader, Center } from "@mantine/core";
import { signOut } from "firebase/auth";
import { useDisclosure } from "@mantine/hooks";
import { Modal, Button } from "@mantine/core";
import { db } from "@/server/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  deleteDoc,
} from "firebase/firestore";

function CreateTodo({ onCreate }: { onCreate: (text: string) => void }) {
  const [opened, { open, close }] = useDisclosure(false);
  const [text, setText] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (text.trim() === "") return;
    onCreate(text.trim());
    setText("");
    close();
  }

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title="Create Todo"
        classNames={{
          content: "bg-white rounded-xl shadow-2xl border-0",
          header: "border-b border-gray-100 pb-4",
          title: "text-lg font-semibold text-gray-900",
          close: "hover:bg-gray-100 rounded-full",
        }}
      >
        <form onSubmit={handleSubmit} className="mt-6">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
            autoFocus
          />
          <Button
            type="submit"
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Add Todo
          </Button>
        </form>
      </Modal>

      <button
        onClick={open}
        className="w-full sm:w-auto bg-white border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-600 hover:text-blue-600 font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        Add New Todo
      </button>
    </>
  );
}

function EditTodo({
  todo,
  onEdit,
}: {
  todo: { id: string; text: string; completed: boolean } | null;
  onEdit: (id: string, text: string) => void;
}) {
  const [opened, { open, close }] = useDisclosure(false);
  const [text, setText] = useState("");

  useEffect(() => {
    if (todo) {
      setText(todo.text);
      open();
    }
  }, [todo]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!todo) return;
    if (text.trim() === "") return;
    onEdit(todo.id, text.trim());
    close();
  }

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title="Edit Todo"
        classNames={{
          content: "bg-white rounded-xl shadow-2xl border-0",
          header: "border-b border-gray-100 pb-4",
          title: "text-lg font-semibold text-gray-900",
          close: "hover:bg-gray-100 rounded-full",
        }}
      >
        <form onSubmit={handleSubmit} className="mt-6">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Edit todo text"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
            autoFocus
          />
          <Button
            type="submit"
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            Update Todo
          </Button>
        </form>
      </Modal>
    </>
  );
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [todos, setTodos] = useState<
    { id: string; text: string; completed: boolean }[]
  >([]);
  const [selectedTodo, setSelectedTodo] = useState<{
    id: string;
    text: string;
    completed: boolean;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const q = query(
          collection(db, "todos"),
          where("userId", "==", currentUser.uid)
        );
        const snapshot = await getDocs(q);

        const userTodos = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as { id: string; text: string; completed: boolean }[];
        setTodos(userTodos);
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <Center h="100vh" className="bg-gray-50">
        <div className="text-center">
          <Loader size="lg" className="text-blue-600" />
          <p className="mt-4 text-gray-600">Loading your todos...</p>
        </div>
      </Center>
    );
  }

  async function logOut() {
    await signOut(auth);
    router.push("/login");
  }

  async function handleCreate(text: string) {
    if (!user) return;

    try {
      const docRef = await addDoc(collection(db, "todos"), {
        text,
        userId: user.uid,
        createdAt: Date.now(),
        completed: false,
      });
      setTodos((prev) => [...prev, { id: docRef.id, text, completed: false }]);
    } catch (error) {
      console.error("error adding todo: ", error);
    }
  }

  async function handleEdit(id: string, text: string) {
    try {
      const todoRef = doc(db, "todos", id);
      const existingTodo = todos.find((todo) => todo.id === id);
      const completed = existingTodo ? existingTodo.completed : false;
      await updateDoc(todoRef, { text });

      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id ? { ...todo, text, completed } : todo
        )
      );
      setSelectedTodo(null);
    } catch (error) {
      console.log("Error updating todo: ", error);
    }
  }

  async function toggleComplete(id: string, completed: boolean) {
    try {
      const todoRef = doc(db, "todos", id);
      await updateDoc(todoRef, { completed });

      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? { ...todo, completed } : todo))
      );
    } catch (error) {
      console.error("Error toggling complete: ", error);
    }
  }

  async function handleDelete(id: string) {
    try {
      const todoRef = doc(db, "todos", id);
      await deleteDoc(todoRef);

      setTodos((prev) => prev.filter((todo) => todo.id !== id));
      if (selectedTodo?.id === id) {
        setSelectedTodo(null);
      }
    } catch (error) {
      console.error("Error deleting todo: ", error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Welcome back,{" "}
                {user?.displayName?.split(" ")[0] || user?.email?.split("@")[0]}
              </h1>
              <p className="text-gray-600">Here are your todos for today</p>
            </div>
            <button
              onClick={logOut}
              className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Log Out
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
          {/* Create Todo Button */}
          <div className="mb-8">
            <CreateTodo onCreate={handleCreate} />
          </div>

          {/* Todos List */}
          {todos.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No todos yet
              </h3>
              <p className="text-gray-500">
                Create your first todo to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {todos.map((todo, index) => (
                <div
                  key={todo.id}
                  className="group flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 border border-transparent hover:border-gray-200"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-6 h-6 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-500">
                      {index + 1}
                    </div>
                    <button
                      onClick={() => toggleComplete(todo.id, !todo.completed)}
                      aria-label="Toggle complete"
                      className={`w-5 h-5 rounded border border-gray-400 flex items-center justify-center cursor-pointer ${
                        todo.completed
                          ? "bg-blue-600 border-blue-600"
                          : "bg-white"
                      }`}
                    >
                      {todo.completed && (
                        <svg
                          className="w-2 h-2 md:w-4 md:h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </button>
                    <p
                      className={`text-gray-900 font-medium truncate ${
                        todo.completed ? "line-through text-gray-400" : ""
                      }`}
                    >
                      {todo.text}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedTodo(todo)}
                      className="flex-shrink-0 md:opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all duration-200"
                      title="Edit todo"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(todo.id)}
                      className="flex-shrink-0 md:opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-all duration-200"
                      title="Delete todo"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <EditTodo todo={selectedTodo} onEdit={handleEdit} />
      </div>
    </div>
  );
}
