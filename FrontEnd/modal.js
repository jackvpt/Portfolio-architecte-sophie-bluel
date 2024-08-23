let modal = null;
const focusableSelector = "button, a, input, textarea";
let focusables = [];
let previouslyFocusedElement = null;

const openModal = async function (e) {
    e.preventDefault();
    const target = e.target.getAttribute("href");
    if (target.startsWith("#")) {
        modal = document.querySelector(e.target.getAttribute("href"));
    } else {
        modal = await loadModal(target);
    }

    focusables = Array.from(modal.querySelectorAll(focusableSelector));
    previouslyFocusedElement = document.querySelector(":focus");
    modal.style.display = null;
    focusables[0].focus();
    modal.removeAttribute("aria-hidden");
    modal.setAttribute("aria-modal", "true");
    modal.addEventListener("click", closeModal);

    // Get all close buttons
    const allCloseButtons = modal.querySelectorAll(".js-modal-close");
    allCloseButtons.forEach((closeButton) =>
        closeButton.addEventListener("click", closeModal)
    );

    modal
        .querySelector(".js-modal-stop")
        .addEventListener("click", stopPropagation);

    // Default display
    document.querySelector(".modal-galery").style.display = "block";
    document.querySelector(".modal-addPhoto").style.display = "none";

    // Button 'Add photo' click event
    modal.querySelector(".modal-btnAddPhoto").addEventListener("click", () => {
        document.querySelector(".modal-galery").style.display = "none";
        document.querySelector(".modal-addPhoto").style.display = "block";
        document.querySelector(".modal-setImage").style.display = "flex";
        document.querySelector(".modal-displayImage").style.display = "none";
    });

    // Button 'Back' click event
    modal.querySelector(".js-modal-back").addEventListener("click", () => {
        document.querySelector(".modal-galery").style.display = "block";
        document.querySelector(".modal-addPhoto").style.display = "none";
    });

    // Get categories from API
    const reponseCategories = await fetch(
        "http://localhost:5678/api/categories"
    );
    const categories = await reponseCategories.json();
    // Set all categories (avoiding double values)
    const categoriesSet = new Set();
    for (let i = 0; i < categories.length; i++) {
        categoriesSet.add(categories[i].name);
    }
    // Add 'options' to the 'select'
    categoriesSet.forEach((category, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.text = category;
        document.getElementById("listCategories").appendChild(option);
    });

    const works = populateWorks("Tous");
};

const displayFirstPage = function (e) {
    document.querySelector(".modal-addPhoto").style.display = "none";
};

const closeModal = function (e) {
    if (modal === null) return;
    if (previouslyFocusedElement !== null) previouslyFocusedElement.focus();
    e.preventDefault();
    window.setTimeout(function () {
        modal.style.display = "none";
        modal = null;
    }, 500);
    modal.setAttribute("aria-hidden", "true");
    modal.removeAttribute("aria-modal");
    modal.removeEventListener("click", closeModal);
    modal
        .querySelector(".js-modal-close")
        .removeEventListener("click", closeModal);
    modal
        .querySelector(".js-modal-stop")
        .removeEventListener("click", stopPropagation);
};

const stopPropagation = function (e) {
    e.stopPropagation();
};

const focusInModal = function (e) {
    e.preventDefault();
    let index = focusables.findIndex(
        (f) => f === modal.querySelector(":focus")
    );
    if (e.shiftKey === true) {
        index--;
    } else {
        index++;
    }
    if (index >= focusables.length) {
        index = 0;
    }
    if (index < 0) {
        index = focusables.length - 1;
    }
    focusables[index].focus();
};

const loadModal = async function (url) {
    const target = "#" + url.split("#")[1];
    const existingModal = document.querySelector(target);
    if (existingModal !== null) return existingModal;
    const html = await fetch(url).then((response) => response.text());
    const element = document
        .createRange()
        .createContextualFragment(html)
        .querySelector(target);
    if (element === null)
        throw `L'élément ${target} n'a pas été trouvé dans la page ${url}`;
    document.body.append(element);
    return element;
};

document.querySelectorAll(".js-modal").forEach((a) => {
    a.addEventListener("click", openModal);
});

window.addEventListener("keydown", function (e) {
    if (e.key === "Escape" || e.key === "Esc") {
        closeModal(e);
    }
    if (e.key === "Tab" && modal !== null) {
        focusInModal(e);
    }
});

async function populateWorks() {
    // Get data from API
    const reponseWorks = await fetch("http://localhost:5678/api/works");
    const works = await reponseWorks.json();
    // Get DOM element hosting works
    const modalPortfolio = document.querySelector(".modal-portfolio");
    modalPortfolio.innerHTML = "";

    for (let i = 0; i < works.length; i++) {
        const work = works[i];
        // 'Figure'' creation for work
        const workElement = document.createElement("div");
        workElement.id = "deleteWorkFigure_" + work.id;

        // Tags creation ('img', 'button', 'i')
        const imageElement = document.createElement("img");
        imageElement.src = work.imageUrl;
        const trashButton = document.createElement("button");
        trashButton.name = work.id;
        trashButton.className = "modal-button-trash";
        const iconElement = document.createElement("i");
        iconElement.name = work.id;
        iconElement.className = "fa-solid fa-trash-can fa-xs";
        trashButton.appendChild(iconElement);
        trashButton.addEventListener("click", async function (event) {
            // Delete data with API
            const responseDelete = await fetch(
                "http://localhost:5678/api/works/" + event.target.name,
                {
                    method: "DELETE",
                    headers: {
                        Authorization:
                            "Bearer " +
                            window.localStorage.getItem("loginToken"),
                    },
                }
            );
            if (responseDelete.ok) {
                const idToDelete = event.target.name;
                console.log("L'id N° " + idToDelete + " a été supprimé");
                document.getElementById(
                    "deleteWorkFigure_" + idToDelete
                ).style.display = "none";
                document.getElementById(
                    "portfolioWorkFigure_" + idToDelete
                ).style.display = "none";
            }
        });

        // Work Element added to Gallery
        modalPortfolio.appendChild(workElement);
        workElement.appendChild(imageElement);
        workElement.appendChild(trashButton);
    }
}

const formNewWork = document.getElementById("formNewWork");
formNewWork.addEventListener("submit", async function (event) {
    // Prevent submit default action
    event.preventDefault();

    formData = await checkNewWorkData();
    console.log("formdata", formData);

    const loginToken = window.localStorage.getItem("loginToken");

    const response = await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: {
            accept: "application/json",
            Authorization: "Bearer " + loginToken,
        },
        body: formData,
    });
    if (response.ok) {
        console.log("Ajouté");
        modal.querySelector(".js-modal-close").click();
        location.reload();
    }
});

function triggerInputFile() {
    document.getElementById("inputFile").click();
}

async function checkNewWorkData() {
    // Get data from DOM
    const image = document.getElementById("inputFile").files[0];
    // Display image in 'img'
    document.getElementById("selectedImage").src = URL.createObjectURL(image);
    document.querySelector(".modal-setImage").style.display = "none";
    document.querySelector(".modal-displayImage").style.display = "flex";

    const title = document.getElementById("title").value;
    const categoryName = document.getElementById("listCategories").value;
    let categoryId = 0;

    // Build 'FormData' from data
    const formData = new FormData();
    formData.append("image", image);
    formData.append("title", title);

    // Convert category name to category id with API fetch
    const responseCategories = await fetch(
        "http://localhost:5678/api/categories"
    );
    const categories = await responseCategories.json();

    categories.forEach((category) => {
        if (category.name === categoryName) {
            categoryId = parseInt(category.id);
        }
    });
    formData.append("category", categoryId);

    if (image && title && categoryName) {
        document.getElementById("btnSubmitAddNewWork").disabled = false;
        return formData;
    } else {
        document.getElementById("btnSubmitAddNewWork").disabled = true;
    }
}
