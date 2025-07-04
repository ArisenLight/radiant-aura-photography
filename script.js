//main page
document.addEventListener('DOMContentLoaded', () => {
    const images = [
        "Gallery/highlights/maternity/Image8.jpeg",
        "Gallery/highlights/formal/Image28.jpeg",
        "Gallery/highlights/family/Image18.jpg",
        "Gallery/highlights/family/Image13.jpg",
        "Gallery/highlights/maternity/Image21.jpg",
        "Gallery/highlights/formal/Image29.jpeg",
        "Gallery/highlights/maternity/Image2.jpeg"
    ];

    let index = 0;
    const imageElement = document.getElementById("carousel-image");
    const hamburger = document.getElementById("hamburger");
    const navMenu = document.getElementById("navMenu"); 

    if (imageElement) {
        imageElement.src = images[0];
        setInterval(() => {
            index = (index + 1) % images.length;
            imageElement.src = images[index];
        }, 3000);
    }

    hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('show');

    const icon = hamburger.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
});
})


//gallery
document.addEventListener('DOMContentLoaded', () => {
    const maternityImages = [
    "Gallery/highlights/maternity/Image1.jpeg",
    "Gallery/highlights/maternity/Image2.jpeg",
    "Gallery/highlights/maternity/Image3.jpeg",
    "Gallery/highlights/maternity/Image4.jpeg",
    "Gallery/highlights/maternity/Image5.jpeg",
    "Gallery/highlights/maternity/Image8.jpeg",
    "Gallery/highlights/maternity/Image10.jpg",
    "Gallery/highlights/maternity/Image11.jpg",
    "Gallery/highlights/maternity/Image14.jpg",
    "Gallery/highlights/maternity/Image15.jpg",
    "Gallery/highlights/maternity/Image16.jpg",
    "Gallery/highlights/maternity/Image17.jpg",
    "Gallery/highlights/maternity/Image21.jpg",
    "Gallery/highlights/maternity/Image23.jpg",
    "Gallery/highlights/maternity/Image27.jpeg"
    ];

    let matIndex = 0;
    const matImgEl = document.querySelector('.maternity-image');

        if (matImgEl) {
    setInterval(() => {
        matIndex = (matIndex + 1) % maternityImages.length;
        matImgEl.src = maternityImages[matIndex];
        }, 3000);
    }

    const familyImages = [
        "Gallery/highlights/family/Image6.jpg",
        "Gallery/highlights/family/Image7.jpg",
        "Gallery/highlights/family/Image9.jpeg",
        "Gallery/highlights/family/Image12.jpg",
        "Gallery/highlights/family/Image13.jpg",
        "Gallery/highlights/family/Image18.jpg",
        "Gallery/highlights/family/Image19.jpg",
        "Gallery/highlights/family/Image20.jpg",
        "Gallery/highlights/family/Image22.jpg",
        "Gallery/highlights/family/Image23.jpg",
        "Gallery/highlights/family/Image24.jpg",
        "Gallery/highlights/family/Image25.jpg",
    ];

    let famIndex = 0;
    const famImgEl = document.querySelector('.family-image');

        if (famImgEl) {
            setInterval(() => {
                famIndex = (famIndex + 1) % familyImages.length;
                famImgEl.src = familyImages[famIndex];
            }, 3000);
        }

        const formalImages = [
            "Gallery/highlights/formal/Image28.jpeg",
            "Gallery/highlights/formal/Image29.jpeg",
            "Gallery/highlights/formal/Image30.jpeg",
            "Gallery/highlights/formal/Image26.jpeg"
        ];

        let formIndex = 0;
        const formImgEl = document.querySelector('.formal-image');

            if (formImgEl) {
                setInterval(() => {
                    formIndex = (formIndex + 1) % formalImages.length;
                    formImgEl.src = formalImages[formIndex];
                }, 3000);
            }
});
