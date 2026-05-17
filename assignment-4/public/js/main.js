/* ============================================
   VANILLA JAVASCRIPT — Navigation & Menu
   (Assignment 2 requirement: no frameworks for menu)
   ============================================ */
document.addEventListener('DOMContentLoaded', function () {

    /* ─── Grab DOM elements ─── */
    const menuBtn = document.getElementById('menuBtn');
    const navMenu = document.getElementById('navMenu');
    const searchIcon = document.getElementById('searchIcon');
    const searchBar = document.getElementById('searchBar');
    const closeSearch = document.getElementById('closeSearch');
    const dropdowns = document.querySelectorAll('.dropdown');
    const navLinks = document.querySelectorAll('.nav-menu a');
    const tabs = document.querySelectorAll('.tab');

    /* ─── Hamburger Menu Toggle ─── */
    if (menuBtn) {
        menuBtn.addEventListener('click', function () {
            navMenu.classList.toggle('active');
            menuBtn.innerHTML = navMenu.classList.contains('active') ? '✕' : '☰';
        });
    }

    /* ─── Search Bar Toggle ─── */
    if (searchIcon) {
        searchIcon.addEventListener('click', function () {
            searchBar.classList.add('active');
        });
    }

    if (closeSearch) {
        closeSearch.addEventListener('click', function () {
            searchBar.classList.remove('active');
        });
    }

    /* ─── Mobile Dropdown Toggle ─── */
    dropdowns.forEach(function (dropdown) {
        const dropdownLink = dropdown.querySelector('a');
        if (!dropdownLink) return;

        dropdownLink.addEventListener('click', function (e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                dropdown.classList.toggle('active');
            }
        });
    });

    /* ─── Close mobile menu when nav link is clicked ─── */
    navLinks.forEach(function (link) {
        link.addEventListener('click', function () {
            const isDropdownToggle = link.parentElement.classList.contains('dropdown');
            if (window.innerWidth <= 768 && !isDropdownToggle) {
                navMenu.classList.remove('active');
                if (menuBtn) menuBtn.innerHTML = '☰';
            }
        });
    });

    /* ─── Reset menu state on resize to desktop ─── */
    window.addEventListener('resize', function () {
        if (window.innerWidth > 768) {
            if (navMenu) navMenu.classList.remove('active');
            if (menuBtn) menuBtn.innerHTML = '☰';
            dropdowns.forEach(function (d) {
                d.classList.remove('active');
            });
        }
    });

    /* ─── Tab switching (New / Best Seller / Trending) ─── */
    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
});


/* ============================================
   jQUERY — Slick Carousel ONLY
   (Slick is a jQuery plugin)
   ============================================ */
$(document).ready(function () {

    /* Skip carousel init if not on a page that has it */
    if ($('#productsCarousel').length === 0) return;

    /* Total slides count */
    var totalCards = $('#productsCarousel .product-card').length;
    $('#total-slides').text(totalCards);

    /* Initialize Slick Carousel */
    $('#productsCarousel').slick({
        infinite: true,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        pauseOnHover: false,
        arrows: false,
        dots: false,
        speed: 500,
        responsive: [
            { breakpoint: 992, settings: { slidesToShow: 2 } },
            { breakpoint: 576, settings: { slidesToShow: 1 } }
        ]
    });

    /* Custom Prev / Next buttons */
    $('#prevBtn').on('click', function () {
        $('#productsCarousel').slick('slickPrev');
    });

    $('#nextBtn').on('click', function () {
        $('#productsCarousel').slick('slickNext');
    });

    /* Slide counter update */
    $('#productsCarousel').on('afterChange', function (event, slick, currentSlide) {
        $('#current-slide').text(currentSlide + 1);
    });

    /* Pause autoplay on hover */
    $('#productsCarousel').on('mouseenter', '.product-card', function () {
        $('#productsCarousel').slick('slickPause');
    });

    $('#productsCarousel').on('mouseleave', '.product-card', function () {
        $('#productsCarousel').slick('slickPlay');
    });
});
