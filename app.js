function createCheckAndTrashBtn(todoContent) {
  //create green check
  let completeBtn = document.createElement("button");
  completeBtn.classList.add("complete");
  completeBtn.innerHTML = `<i class="fa-solid fa-check"></i>`;
  completeBtn.addEventListener("click", (e) => {
    // console.log(e.target.parentElement.children[0].textContent);
    //會發現大部份時候會點到<i>, 很少會點到<button>
    //這時候要去css檔裡設定<i>的pointer-event: none
    let todoItem = e.target.parentElement;
    todoItem.classList.toggle("done");

    let myListArr = JSON.parse(localStorage.getItem("list"));
    let targetText = e.target.parentElement.children[0].textContent;

    myListArr.forEach((item) => {
      if (item.todoText === targetText) {
        // console.log("done:", item.done, typeof item.done);
        item.done = !item.done;
        localStorage.setItem("list", JSON.stringify(myListArr));
      }
    });

    console.log("myListArr", myListArr, "target", targetText);
  });
  //create red trash can
  let trashBtn = document.createElement("button");
  trashBtn.classList.add("trash");
  trashBtn.innerHTML = `<i class="fa-solid fa-trash"></i>`;
  trashBtn.addEventListener("click", (e) => {
    let todoItem = e.target.parentElement;
    todoItem.addEventListener("animationend", () => {
      //remove from localStorage
      let text = todoItem.children[0].innerText;
      myListArr = JSON.parse(localStorage.getItem("list"));
      myListArr.forEach((item, index) => {
        if (item.todoText === text) {
          myListArr.splice(index, 1);
          localStorage.setItem("list", JSON.stringify(myListArr));
        }
      });

      //移除 <div>
      todoItem.remove();
    });

    todoItem.style.animation = "scaleDown 0.3s forwards";
    // todoItem.remove() 如果沒有用addeventListener，直接這樣寫
    //上面動畫這行的程式碼還沒執行完，就馬上執行 remove了，所以看不到動畫
  });

  todoContent.appendChild(completeBtn);
  todoContent.appendChild(trashBtn);
}

function mergeTime(arr1, arr2) {
  let result = [];
  let i = 0;
  let j = 0;
  while (i < arr1.length && j < arr2.length) {
    if (Number(arr1[i].todoMonth) > Number(arr2[j].todoMonth)) {
      result.push(arr2[j]);
      j++;
    } else if (Number(arr1[i].todoMonth) < Number(arr2[j].todoMonth)) {
      result.push(arr1[i]);
      i++;
    } else if (Number(arr1[i].todoMonth) === Number(arr2[j].todoMonth)) {
      if (Number(arr1[i].todoDay) > Number(arr2[j].todoDay)) {
        result.push(arr2[j]);
        j++;
      } else {
        result.push(arr1[i]);
        i++;
      }
    }
  }
  while (i < arr1.length) {
    result.push(arr1[i]);
    i++;
  }
  while (j < arr2.length) {
    result.push(arr2[j]);
    j++;
  }

  return result;
}

function mergeSort(arr) {
  if (arr.length === 1) {
    return arr;
  } else {
    let middle = Math.floor(arr.length / 2);
    let left = arr.slice(0, middle);
    let right = arr.slice(middle, arr.length);
    return mergeTime(mergeSort(left), mergeSort(right));
  }
}

let addBtn = document.querySelector("form button");
let section = document.querySelector("section");

addBtn.addEventListener("click", (e) => {
  // console.log(e.target.parentElement)

  //prevent form from being submitted
  e.preventDefault();

  //get the input values
  let form = e.target.parentElement;
  // console.log(form.children)
  let todoText = form.children[0].value;
  let todoMonth = form.children[1].value;
  let todoDay = form.children[2].value;

  if (todoText === "") {
    alert("please enter something");
    return; //記得加return，才不會繼續執行下方的程式碼
  }
  if (
    Number(todoMonth) > 12 ||
    Number(todoMonth) < 1 ||
    Number(todoDay) > 31 ||
    Number(todoDay) < 1
  ) {
    alert("please enter right date");
    return;
  }

  //create an todo item
  let todoContent = document.createElement("div");
  todoContent.classList.add("todo");

  let text = document.createElement("p");
  text.classList.add("todo-text");
  text.innerText = todoText;

  let time = document.createElement("p");
  time.classList.add("todo-time");
  time.innerText = todoMonth + " / " + todoDay;

  todoContent.appendChild(text);
  todoContent.appendChild(time);

  //create green check and red trash
  createCheckAndTrashBtn(todoContent);

  //add animation use @keyframes
  todoContent.style.animation = "scaleUp 0.4s forwards";

  //create an object
  let myTodoObj = {
    todoText: todoText,
    todoMonth: todoMonth,
    todoDay: todoDay,
    done: false,
  };

  //store data in an array of objects
  let myList = localStorage.getItem("list");
  if (myList === null) {
    localStorage.setItem("list", JSON.stringify([myTodoObj]));
  } else {
    let myListArr = JSON.parse(myList);
    myListArr.push(myTodoObj);
    localStorage.setItem("list", JSON.stringify(myListArr));
  }
  // console.log(JSON.parse(localStorage.getItem("list")))

  //Clear Inputs
  form.children[0].value = "";
  form.children[1].value = "";
  form.children[2].value = "";

  section.appendChild(todoContent);
});

loadData();

function loadData() {
  //load Data
  let myList = localStorage.getItem("list");

  if (myList === "[]") {
    localStorage.removeItem("list");
  }

  if (myList !== null) {
    let myListArr = JSON.parse(myList);
    myListArr.forEach((element) => {
      let todoContent = document.createElement("div");
      todoContent.classList.add("todo");
      if (element.done === true) {
        todoContent.classList.add("done");
      }

      let text = document.createElement("p");
      text.classList.add("todo-text");
      text.innerText = element.todoText;

      let time = document.createElement("p");
      time.classList.add("todo-time");
      time.innerText = element.todoMonth + " / " + element.todoDay;

      todoContent.appendChild(text);
      todoContent.appendChild(time);

      //create green check and red trash
      createCheckAndTrashBtn(todoContent);

      section.appendChild(todoContent);
    });
  }
}

const sortButton = document.querySelector("div.sort button");
sortButton.addEventListener("click", () => {
  let sortedArray = mergeSort(JSON.parse(localStorage.getItem("list")));
  localStorage.setItem("list", JSON.stringify(sortedArray));

  //remove data
  let len = section.children.length; //???為什麼要塞入變數才可以正常移除???
  for (let i = 0; i < len; i++) {
    section.children[0].remove();
  }
  loadData();
});
