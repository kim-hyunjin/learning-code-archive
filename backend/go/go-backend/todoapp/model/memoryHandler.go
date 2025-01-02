package model

import "time"

type memoryHandler struct {
	todoMap map[int]*Todo
}

func newMemoryHandler() DbHandler {
	m := &memoryHandler{}
	m.todoMap = make(map[int]*Todo)
	return m
}

func (m *memoryHandler) GetTodos(sessionId string) []*Todo {
	list := []*Todo{}
	for _, v := range m.todoMap {
		list = append(list, v)
	}
	return list
}

func (m *memoryHandler) AddTodo(name string, sessionId string) *Todo {
	id := len(m.todoMap) + 1
	todo := &Todo{id, sessionId, name, false, time.Now()}
	m.todoMap[id] = todo
	return todo
}

func (m *memoryHandler) DeleteTodo(id int) bool {
	if _, ok := m.todoMap[id]; ok {
		delete(m.todoMap, id)
		return true
	}
	return false
}

func (m *memoryHandler) CompleteTodo(id int, complete bool) bool {
	if todo, ok := m.todoMap[id]; ok {
		todo.Completed = complete
		return true
	}
	return false
}

func (m *memoryHandler) Close() {
	
}