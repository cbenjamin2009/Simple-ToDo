
//Get data-lists element
const listsContainer = document.querySelector('[data-lists]')
//get list form element
const newListForm = document.querySelector('[data-new-list-form]')
//get list input element
const newListInput = document.querySelector('[data-new-list-input]')
//get delete list button
const deleteListButton = document.querySelector('[data-delete-list-button]')
//get list display container
const listDisplayContainer = document.querySelector('[data-list-display-container]')
//get list title element
const listTitleElement = document.querySelector('[data-list-title]')
//get list count element
const listCountElement = document.querySelector('[data-list-count]')
//get list's tasks element
const tasksContainer = document.querySelector('[data-tasks]')
//HTML task template for creating blank tasks. 
const taskTemplate = document.getElementById('task-template')
// new task item form
const newTaskForm = document.querySelector('[data-new-task-form]')
//get new task input section
const newTaskInput = document.querySelector('[data-new-task-input]')
//get clear completed tasks element for event
const clearCompleteTasksButton = document.querySelector('[data-clear-complete-tasks-button]')
//get delete task button element
const deleteTaskButton = document.querySelector('[data-delete-task-button]')

//create key for storage name space to store separate from any other site 
const LOCAL_STORAGE_LIST_KEY = 'task.lists'
//selected list key
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = 'task.selectedListId'

//Create an event listener for all dynamically added "li" events so when a list is clicked, it will get the ID and set it to selected. 

listsContainer.addEventListener ('click', e => {
    if (e.target.tagName.toLowerCase() === 'li') {
        selectedListID = e.target.dataset.listId
        saveAndRender();
    }
})

//Create an array, first check local storage and populate using JSON.parse for any existing list, otherwise load blank array. 
let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || []

//Select list
let selectedListID = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY)

//Add event listener for delete button click 

deleteListButton.addEventListener ('click', e => {
    lists = lists.filter(list => list.id !== selectedListID)
    selectedListID = null
    saveAndRender()
})

 
addGlobalEventListener("click", "[data-delete-task-button]", e => {
    
    e.preventDefault()

    const selectedList = lists.find(list => list.id === selectedListID)
    const selectedTask = e.target.parentNode
    // this only removes the Div but doesn't remove it from the saved list
    //tasksContainer.removeChild(selectedTask)
    //this removes it from the local storage using .pop() function and gratting Selected Task. 
    selectedList.tasks.pop(selectedTask)
    saveAndRender();  
})

//Global Event LIstener so every click that matches function will happen. 
function addGlobalEventListener(type, selector, callback) {
    document.addEventListener(type, e => {
        if (e.target.matches(selector)) callback (e)
    })
}


clearCompleteTasksButton.addEventListener('click', e => {
    const selectedList = lists.find(list => list.id === selectedListID)
    selectedList.tasks = selectedList.tasks.filter(task => !task.complete)
    saveAndRender();
}
)

tasksContainer.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() === 'input') {
        const selectedList = lists.find(list => list.id === selectedListID)
        const selectedTask = selectedList.tasks.find(task => task.id === e.target.id)
        selectedTask.complete = e.target.checked
        save()
        renderTaskCount(selectedList)
    }
})


//On submit, take the value, add it to the list, then clear the value in the input and render(). 
newListForm.addEventListener('submit', e => {
    //prevent form from refreshing page
    e.preventDefault()
    const listName = newListInput.value
    if (listName == null || listName === '') return
    const list = createList(listName)
    newListInput.value = null
    lists.push(list)
    saveAndRender();
})

//On submit, take the value, add it to the task list, then clear the value in the input and render(). 
newTaskForm.addEventListener('submit', e => {
    //prevent form from refreshing page
    e.preventDefault()
    const taskName = newTaskInput.value
    if (taskName == null || taskName === '') return
    const task = createList(taskName)
    newTaskInput.value = null
    const selectedList = lists.find(list => list.id === selectedListID)
    selectedList.tasks.push(task)
    saveAndRender();
})



function saveAndRender() {
    save()
    render()
}

//save function for saving to local storage (LOCAL_STORAGE_LIST_KEY)
function save() {
    //save list iems to local storage
    localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists))
    //save the selected list to local storage so it populates on load as selected list. 
    localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListID)
    
}

//Function creates the last name and assigns the ID using current date/time to get a unique ID number 
function createList(name) {
   return {id: Date.now().toString(), name: name, tasks: []}
}

//Function creates new task in list. 
function createTask(name) {
   return {id: Date.now().toString(), name: name, complete: false}
    
}
//Create a function that will creeate a LI, add the list-name class, and populate the text, append it to the end of the Lists Container array
function render() {
    clearElement(listsContainer)
    renderLists()
    const selectedList = lists.find(list => list.id === selectedListID)
    if (selectedListID == null) {
        listDisplayContainer.style.display = 'none'
    } else {
        listDisplayContainer.style.display = ''
        listTitleElement.innerText = selectedList.name
        renderTaskCount(selectedList)
        clearElement(tasksContainer)
        renderTasks(selectedList)
    }
}

function deleteTasks(e) {
    e.parentNode.parentNode.parentNode.removeChild(e.parentNode.parentNode);
}


//Create task list by importing HTML task template and assigning values. 
function renderTasks(selectedList) {
    selectedList.tasks.forEach(task => {
        const taskElement = document.importNode(taskTemplate.content, true)
        const checkbox = taskElement.querySelector('input')
        checkbox.id = task.id
        checkbox.checked = task.complete
        const label = taskElement.querySelector('label')
        label.htmlFor = task.id
        label.append(task.name)
        tasksContainer.appendChild(taskElement)
    })
}

function renderTaskCount(selectedList) {
    const incompleteTaskCount = selectedList.tasks.filter(task => !task.complete).length
    if (incompleteTaskCount === 0){
        listCountElement.innerText = "Congratulations, no tasks!"
    }
    else {
    //singular or plural 
    const taskString = incompleteTaskCount === 1 ? "task" : "tasks"
    listCountElement.innerText = `${incompleteTaskCount} ${taskString} remaining`
    }
}

function renderLists() {
    lists.forEach(list => {
        const listElement = document.createElement('li')
        listElement.dataset.listId = list.id
        listElement.classList.add("list-name")
        listElement.innerText = list.name
        if (list.id === selectedListID) {listElement.classList.add('active-list')}
        listsContainer.appendChild(listElement)
    })
}

function clearElement(element) {
while(element.firstChild) {
    element.removeChild(element.firstChild)
    }
}


render();