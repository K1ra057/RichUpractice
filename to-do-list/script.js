const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskCategory = document.getElementById("task-category");

let tasks = JSON.parse(localStorage.getItem("tasks")) || {
  design: [
    { text: "Create icons for a dashboard", done: false },
    { text: "Plan your meal", done: false },
    { text: "Prepare a design presentation", done: false },
  ],
  personal: [
    {
      text: "Review daily goals before sleeping. Add some new if time permits",
      done: false,
    },
    { text: "Stretch for 15 minutes", done: false },
  ],
  house: [{ text: "Water indoor plants", done: false }],
};

function renderTasks() {
  ["design", "personal", "house"].forEach((cat) => {
    const ul = document.getElementById(cat);
    ul.innerHTML = "";
    tasks[cat].forEach((task, index) => {
      const li = document.createElement("li");
      li.draggable = true;
      li.dataset.index = index;

      li.innerHTML = `
        <input type="checkbox" ${task.done ? "checked" : ""}>
        <label class="${task.done ? "completed" : ""}">${task.text}</label>
        <button onclick="deleteTask('${cat}', ${index})">❌</button>
      `;

      li.querySelector("input").addEventListener("change", (e) => {
        tasks[cat][index].done = e.target.checked;
        saveTasks();
      });

      // Drag events
      li.addEventListener("dragstart", () => li.classList.add("dragging"));
      li.addEventListener("dragend", () => {
        li.classList.remove("dragging");
        reorderTasks(cat);
      });

      ul.appendChild(li);
    });
  });
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
}

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const category = taskCategory.value;
  tasks[category].push({ text: taskInput.value, done: false });
  taskInput.value = "";
  saveTasks();
});

function deleteTask(category, index) {
  tasks[category].splice(index, 1);
  saveTasks();
}

function reorderTasks(category) {
  const ul = document.getElementById(category);
  const newOrder = [];
  ul.querySelectorAll("li").forEach((li) => {
    newOrder.push(tasks[category][li.dataset.index]);
  });
  tasks[category] = newOrder;
  saveTasks();
}

// DragOver для списків
document.querySelectorAll(".task-list").forEach((list) => {
  list.addEventListener("dragover", (e) => {
    e.preventDefault();
    const dragging = document.querySelector(".dragging");
    const afterElement = getDragAfterElement(list, e.clientY);
    if (afterElement == null) {
      list.appendChild(dragging);
    } else {
      list.insertBefore(dragging, afterElement);
    }
  });
});

function getDragAfterElement(container, y) {
  const elements = [...container.querySelectorAll("li:not(.dragging)")];
  return elements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

renderTasks();
