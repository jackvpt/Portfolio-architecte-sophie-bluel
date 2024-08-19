// Get data from API
const reponseWorks = await fetch("http://localhost:5678/api/works");
const works = await reponseWorks.json();
const reponseCategories = await fetch("http://localhost:5678/api/categories");
const categories = await reponseCategories.json();

let filter =  "Tous";

// Set all categories
const categoriesSet = new Set();
categoriesSet.add("Tous");

for (let i = 0; i < categories.length; i++) {
    categoriesSet.add(categories[i].name);
}

populateFilterBar(categories);

function populateFilterBar(categories) {
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
            populateWorks(works, filter);
        });

        // Add Button to Filter Bar
        filterBar.appendChild(filterBarButton);
    }
}

populateWorks(works, filter);

function populateWorks(works, filter) {
    // Get DOM element hosting works
    const sectionGallery = document.querySelector(".gallery");
    sectionGallery.innerHTML = "";

    for (let i = 0; i < works.length; i++) {
        const work = works[i];
        if (filter === "Tous" || filter === work.category.name) {
            // Tag creation for work
            const workElement = document.createElement("figure");
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
