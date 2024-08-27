import { populateModalSelect, populateModalWorks } from "./modal.js"

let filter = "Tous"

/**
 * Waiting for DOM
 */
document.addEventListener("DOMContentLoaded", ready)

function ready() {
    setEventListeners()
    checkLogin()
    populateFilterBar()
    populateWorks(filter)
}

/**
 * EVENT LISTENERS
 */
function setEventListeners() {
    document.getElementById("anchor-login-logout").addEventListener("click", loginLogout)
}

/**
 * LOGIN AND LOGOUT
 */
function loginLogout() {
    // State is logged in - Action is logging out
    if (localStorage.getItem("loginToken") !== null) {
        localStorage.removeItem("loginToken")
        checkLogin()
    } else { // State is logged out - Action is logging in
        location.replace("login.html")
    }
}

/**
 * CHECK TOKEN AND TOGGLE MODE
 */
function checkLogin() {
    if (localStorage.getItem("loginToken") !== null) {
        document.querySelector(".edition-mode").style.display = "block"
        document.querySelector(".portfolio-modify").style.display = "block"
        document.querySelector(".filter-bar").style.display = "none"
        document.getElementById("anchor-login-logout").innerText = "logout"
    } else {
        document.querySelector(".edition-mode").style.display = "none"
        document.querySelector(".portfolio-modify").style.visibility = "hidden"
        document.getElementById("anchor-login-logout").innerText = "login"
        document.querySelector(".filter-bar").style.display = "flex"
    }
}

/**
 * POPULATE FILTER BAR
 */
async function populateFilterBar() {
    // Get data from API
    try {
        const responseCategories = await fetch(
            "http://localhost:5678/api/categories"
        )

        if (!responseCategories.ok) {
            throw new Error(`Une erreur s'est produite (${responseCategories.status}). Veuillez réessayer plus tard.`)
        }
        const categories = await responseCategories.json()

        // Set all categories (avoiding double values)
        const categoriesSet = new Set()
        categoriesSet.add(["Tous", 0])

        for (let i = 0; i < categories.length; i++) {
            categoriesSet.add([categories[i].name, categories[i].id])
        }

        // Populate 'select' in 'modal.js'
        populateModalSelect(categoriesSet)

        // Get DOM element hosting filter bar
        const filterBar = document.querySelector(".filter-bar")
        filterBar.innerHTML = ""

        for (let categoryTuple of categoriesSet) {
            const category = categoryTuple[0]
            // Button creation
            const filterBarButton = document.createElement("button")
            filterBarButton.textContent = category

            // Make button active if its category is equal to filter
            if (category === filter) {
                filterBarButton.classList.add("button-active")
            }

            // Filter click event
            filterBarButton.addEventListener("click", function () {
                filter = category
                populateFilterBar(categories)
                populateWorks(filter)
            })

            // Add Button to Filter Bar
            filterBar.appendChild(filterBarButton)
        }
    }
    catch (error) {
        alert(error)
    }
}

/**
 * POPULATE PORTFOLIO
 * @param {string} filter 
 */
async function populateWorks(filter) {
    try {
        // Get data from API
        const responseWorks = await fetch("http://localhost:5678/api/works")
        if (!responseWorks.ok) {
            throw new Error(`Une erreur s'est produite (${responseWorks.status}). Veuillez réessayer plus tard.`)
        }
        const works = await responseWorks.json()

        // Get DOM element hosting works
        const sectionGallery = document.querySelector(".gallery")
        sectionGallery.innerHTML = ""

        // Populate Works in 'modal.js'
        populateModalWorks(works)

        // Iterate through works to display only filtered works
        for (let i = 0; i < works.length; i++) {
            const work = works[i]
            if (filter === "Tous" || filter === work.category.name) {
                // Add work element to Gallery
                const workFigure = createWorkFigure(work)
                sectionGallery.appendChild(workFigure)
            }
        }
    }
    catch (error) {
        alert(error)
    }
}

/**
 * CREATE FIGURE FOR WORK DISPLAY
 * Exported in modal.js
 * @param {'figure' html element} work 
 */
export function createWorkFigure(work) {
    // 'figure' creation
    const workElement = document.createElement("figure")
    workElement.id = "portfolioWorkFigure_" + work.id

    // 'img' and 'figcaption' creation
    const imageElement = document.createElement("img")
    imageElement.src = work.imageUrl
    imageElement.alt = work.title
    const captionElement = document.createElement("figcaption")
    captionElement.innerText = work.title

    workElement.appendChild(imageElement)
    workElement.appendChild(captionElement)

    return workElement
}

