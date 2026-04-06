$(document).ready(function () {

    /* ─── Total slides count ─── */
    var totalCards = $('#productsCarousel .product-card').length;
    $('#total-slides').text(totalCards);

    /* ─── Initialize Slick Carousel ─── */
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
            {
                breakpoint: 992,
                settings: { slidesToShow: 2 }
            },
            {
                breakpoint: 576,
                settings: { slidesToShow: 1 }
            }
        ]
    });

    /* ─── Custom Prev / Next buttons ─── */
    $('#prevBtn').on('click', function () {
        $('#productsCarousel').slick('slickPrev');
    });

    $('#nextBtn').on('click', function () {
        $('#productsCarousel').slick('slickNext');
    });

    /* ─── Slide Counter — updates on every slide change ─── */
    $('#productsCarousel').on('afterChange', function (event, slick, currentSlide) {
        $('#current-slide').text(currentSlide + 1);
    });

    /* ─── Pause on card hover, resume on leave ─── */
    $('#productsCarousel').on('mouseenter', '.product-card', function () {
        $('#productsCarousel').slick('slickPause');
    });

    $('#productsCarousel').on('mouseleave', '.product-card', function () {
        $('#productsCarousel').slick('slickPlay');
    });

    /* ─── Tab switching (New / Best Seller / Trending) ─── */
    $('.tab').on('click', function () {
        $('.tab').removeClass('active');
        $(this).addClass('active');
    });

});
