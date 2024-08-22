let filter = "Tous";

checkLogin()

populateFilterBar();

populateWorks(filter);


document.getElementById("anchor-login-logout").addEventListener("click", function () {
    // State is logged in - Action is logging out
    if (window.localStorage.getItem("loginToken") !== null) {
        window.localStorage.removeItem("loginToken")
        checkLogin()
    } else { // Stage is logged out - Action is logging in
        window.location.replace("login.html")
    }
})

function checkLogin() {
    if (window.localStorage.getItem("loginToken") !== null) {
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

async function populateFilterBar() {
    if (window.localStorage.getItem("loginToken") !== null) {
        document.querySelector(".filter-bar").visibility = "hidden"
    }
    else {
        document.querySelector(".filter-bar").visibility = "visible"
    }


    // Get data from API
    const reponseCategories = await fetch(
        "http://localhost:5678/api/categories"
    );
    const categories = await reponseCategories.json();

    // Set all categories
    const categoriesSet = new Set();
    categoriesSet.add("Tous");

    for (let i = 0; i < categories.length; i++) {
        categoriesSet.add(categories[i].name);
    }

    // Get DOM element hosting filter bar
    const filterBar = document.querySelector(".filter-bar");
    filterBar.innerHTML = "";

    for (let category of categoriesSet) {
        // Button creation
        const filterBarButton = document.createElement("button");
        filterBarButton.textContent = category;

        // Make button active if its category is equal to filter
        if (category === filter) {
            filterBarButton.classList.add("button-active");
        }

        filterBarButton.addEventListener("click", function () {
            filter = category;
            populateFilterBar(categories);
            populateWorks(filter);
        });

        // Add Button to Filter Bar
        filterBar.appendChild(filterBarButton);
    }
}



async function populateWorks(filter) {
    // Get data from API
    const reponseWorks = await fetch("http://localhost:5678/api/works");
    const works = await reponseWorks.json();
    // Get DOM element hosting works
    const sectionGallery = document.querySelector(".gallery");
    sectionGallery.innerHTML = "";

    for (let i = 0; i < works.length; i++) {
        const work = works[i];
        if (filter === "Tous" || filter === work.category.name) {
            // Tag creation for work
            const workElement = document.createElement("figure");
            workElement.id = "portfolioWorkFigure_" + work.id
            // Tags creation
            const imageElement = document.createElement("img");
            imageElement.src = work.imageUrl;
            const captionElement = document.createElement("figcaption");
            captionElement.innerText = work.title;

            // Work Element added to Gallery
            sectionGallery.appendChild(workElement);
            workElement.appendChild(imageElement);
            workElement.appendChild(captionElement);
        }
    }
}
