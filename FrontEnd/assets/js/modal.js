import { createWorkFigure } from "./works.js"

setEventListener()

function setEventListener() {
    // Add image 'button' triggers 'input file'
    document.getElementById("addImage").addEventListener("click", () => document.getElementById('inputFile').click())

    // Data to be checked when image, title
    document.getElementById("inputFile").addEventListener("change", checkNewWorkData)
    document.getElementById("title").addEventListener("change", checkNewWorkData)
    document.getElementById("listCategories").addEventListener("change", checkNewWorkData)
}

let modal = null

/**
 * POPULATE 'SELECT' CATEGORIES
 * Function called from 'works.js'
 * @param {Set} categoriesSet 
 */
export function populateModalSelect(categoriesSet) {
    categoriesSet.forEach((categoryTuple) => {
        const category = categoryTuple[0]
        const id = categoryTuple[1]
        if (category !== "Tous") {
            const option = document.createElement("option");
            option.value = id;
            option.text = category;
            document.getElementById("listCategories").appendChild(option);
        }
    });
}

/**
 * OPEN MODAL
 * @param {event} event 
 */
const openModal = async function (event) {
    event.preventDefault();

    // Show Modal
    modal = document.querySelector(event.target.getAttribute("href"));
    modal.style.display = null;
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
};

// Modal to be opened on each '.js-modal' class
document.querySelectorAll(".js-modal").forEach((a) => {
    a.addEventListener("click", openModal);
});

/**
 * CLOSE MODAL
 * @param {event} e 
 * @returns 
 */
const closeModal = function (event) {
    if (modal === null) return;
    event.preventDefault();
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

/**
 * STOP PROPAGATION
 * @param {event} event 
 */
const stopPropagation = function (event) {
    event.stopPropagation();
};

/**
 * KEYBOARD EVENT (close modal when ESC is pressed)
 */
window.addEventListener("keydown", function (event) {
    if (event.key === "Escape" || event.key === "Esc") {
        closeModal(event);
    }
});


/**
 * POPULATE PORTFOLIO
 * Function called from 'works.js'
 * @param {json} works 
 */
export async function populateModalWorks(works) {
    // Get DOM element hosting works
    const modalPortfolio = document.querySelector(".modal-portfolio");
    modalPortfolio.innerHTML = "";

    for (let i = 0; i < works.length; i++) {
        const work = works[i];
        const workElement = createWorkDiv(work)

        // Add work Element to Gallery
        modalPortfolio.appendChild(workElement);
    }
}

function createWorkDiv(work) {
    // 'div' creation for work
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
    trashButton.addEventListener("click", (event) => deleteWork(event));
    workElement.appendChild(imageElement);
    workElement.appendChild(trashButton);

    return workElement
}

/**
 * DELETE WORK
 * @param {event} event 
 */
async function deleteWork(event) {
    try {
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
        if (!responseDelete.ok) {
            throw new Error(`Une erreur s'est produite lors de la suppression d'un élément (${response.status}). Veuillez réessayer plus tard.`)
        }
        const idToDelete = event.target.name;

        document.getElementById(
            "deleteWorkFigure_" + idToDelete
        ).remove();
        document.getElementById(
            "portfolioWorkFigure_" + idToDelete
        ).remove();
    }
    catch (error) {
        alert(error)
    }
}


/**
 * SUBMIT EVENT (ADD WORK TO DB WITH 'POST')
 */
const formNewWork = document.getElementById("formNewWork");
formNewWork.addEventListener("submit", async function (event) {
    // Prevent submit default action
    event.preventDefault();

    // Check datas and retrieve them if check OK
    const formData = await checkNewWorkData();

    // Get Token for POST operation
    const loginToken = localStorage.getItem("loginToken");

    try {
        const response = await fetch("http://localhost:5678/api/works", {
            method: "POST",
            headers: {
                accept: "application/json",
                Authorization: "Bearer " + loginToken,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Une erreur s'est produite lors de l'ajout d'un élément (${response.status}). Veuillez réessayer plus tard.`)
        }

        // Convert response to json object
        const work = await response.json()

        // Create work 'figure' (imported from 'works.js')
        const workFigure = createWorkFigure(work)

        // Add work 'figure' to gallery (to avoid page reload)
        document.querySelector(".gallery").appendChild(workFigure)

        // Create work 'div' 
        const workDiv = createWorkDiv(work)

        // Add work 'div' to modal portfolio
        document.querySelector(".modal-portfolio").appendChild(workDiv)

        // Close modal
        modal.querySelector(".js-modal-close").click();
    }
    catch (error) {
        alert(error)
    }
});

/**
 * CHECK WORK DATA
 * @returns formData
 */
async function checkNewWorkData() {
    // Get file data from DOM
    const title = document.getElementById("title").value;
    const categoryId = document.getElementById("listCategories").value;
    const image = document.getElementById("inputFile").files[0]

    // Display image in 'img' and hide image selection div (if image is defined)
    if (image) {
        document.getElementById("selectedImage").src = URL.createObjectURL(image)
        document.querySelector(".modal-setImage").style.display = "none";
        document.querySelector(".modal-displayImage").style.display = "flex";
    }

    // Check the 3 elements needed
    if (image && title && categoryId) {
        // Build 'FormData' from data
        const formData = new FormData();
        formData.append("image", image);
        formData.append("title", title);
        formData.append("category", parseInt(categoryId));

        // Enable submit button
        document.getElementById("btnSubmitAddNewWork").disabled = false;
        return formData;
    } else {
        // Disable submit button
        document.getElementById("btnSubmitAddNewWork").disabled = true;
    }
}
