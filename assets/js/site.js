(function () {
    const body = document.body;

    if (!body) {
        return;
    }

    const transitionDelay = 380;
    let hasShownPage = false;

    function showPage() {
        if (hasShownPage) {
            return;
        }

        hasShownPage = true;
        body.classList.remove('page-leaving');
        requestAnimationFrame(() => {
            body.classList.add('page-ready');
        });
    }

    if (document.readyState === 'complete') {
        showPage();
    } else {
        window.addEventListener('load', showPage, { once: true });
    }

    window.addEventListener('pageshow', () => {
        if (body.classList.contains('page-ready')) {
            return;
        }

        showPage();
    });

    document.querySelectorAll('a[href]').forEach((link) => {
        const href = link.getAttribute('href');

        if (
            !href ||
            href.startsWith('#') ||
            link.target === '_blank' ||
            link.hasAttribute('download') ||
            href.startsWith('mailto:') ||
            href.startsWith('tel:')
        ) {
            return;
        }

        const nextUrl = new URL(link.href, window.location.href);
        const isHashOnlyNavigation =
            nextUrl.pathname === window.location.pathname &&
            nextUrl.search === window.location.search &&
            nextUrl.hash !== window.location.hash;

        if (isHashOnlyNavigation) {
            return;
        }

        link.addEventListener('click', (event) => {
            if (event.defaultPrevented || event.button !== 0) {
                return;
            }

            if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
                return;
            }

            event.preventDefault();
            body.classList.remove('page-ready');
            body.classList.add('page-leaving');

            window.setTimeout(() => {
                window.location.href = nextUrl.href;
            }, transitionDelay);
        });
    });

    const tiltCards = document.querySelectorAll('.game-card[data-tilt]');
    const canUseTilt = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    if (!canUseTilt) {
        return;
    }

    function resetTilt(card) {
        card.classList.remove('is-tilting');
        card._tiltTarget = {
            cardShiftX: 0,
            cardShiftY: 0,
            cardRotateX: 0,
            cardRotateY: 0,
            cardScale: 1,
            bgOffsetX: 0,
            bgOffsetY: 0,
            imgShiftX: 0,
            imgShiftY: 0,
            imgScale: 1
        };
    }

    function applyTilt(card, values) {
        card.style.setProperty('--card-shift-x', `${values.cardShiftX}px`);
        card.style.setProperty('--card-shift-y', `${values.cardShiftY}px`);
        card.style.setProperty('--card-rotate-x', `${values.cardRotateX}deg`);
        card.style.setProperty('--card-rotate-y', `${values.cardRotateY}deg`);
        card.style.setProperty('--card-scale', `${values.cardScale}`);
        card.style.setProperty('--bg-offset-x', `${values.bgOffsetX}px`);
        card.style.setProperty('--bg-offset-y', `${values.bgOffsetY}px`);
        card.style.setProperty('--img-shift-x', `${values.imgShiftX}px`);
        card.style.setProperty('--img-shift-y', `${values.imgShiftY}px`);
        card.style.setProperty('--img-scale', `${values.imgScale}`);
    }

    function startTiltAnimation(card) {
        if (card._tiltFrame) {
            return;
        }

        const step = () => {
            const current = card._tiltCurrent;
            const target = card._tiltTarget;
            const smoothing = 0.16;

            current.cardShiftX += (target.cardShiftX - current.cardShiftX) * smoothing;
            current.cardShiftY += (target.cardShiftY - current.cardShiftY) * smoothing;
            current.cardRotateX += (target.cardRotateX - current.cardRotateX) * smoothing;
            current.cardRotateY += (target.cardRotateY - current.cardRotateY) * smoothing;
            current.cardScale += (target.cardScale - current.cardScale) * smoothing;
            current.bgOffsetX += (target.bgOffsetX - current.bgOffsetX) * smoothing;
            current.bgOffsetY += (target.bgOffsetY - current.bgOffsetY) * smoothing;
            current.imgShiftX += (target.imgShiftX - current.imgShiftX) * smoothing;
            current.imgShiftY += (target.imgShiftY - current.imgShiftY) * smoothing;
            current.imgScale += (target.imgScale - current.imgScale) * smoothing;

            applyTilt(card, current);

            const isSettled =
                Math.abs(target.cardShiftX - current.cardShiftX) < 0.1 &&
                Math.abs(target.cardShiftY - current.cardShiftY) < 0.1 &&
                Math.abs(target.cardRotateX - current.cardRotateX) < 0.1 &&
                Math.abs(target.cardRotateY - current.cardRotateY) < 0.1 &&
                Math.abs(target.cardScale - current.cardScale) < 0.002 &&
                Math.abs(target.bgOffsetX - current.bgOffsetX) < 0.1 &&
                Math.abs(target.bgOffsetY - current.bgOffsetY) < 0.1 &&
                Math.abs(target.imgShiftX - current.imgShiftX) < 0.1 &&
                Math.abs(target.imgShiftY - current.imgShiftY) < 0.1 &&
                Math.abs(target.imgScale - current.imgScale) < 0.002;

            if (isSettled) {
                applyTilt(card, target);
                card._tiltCurrent = { ...target };

                if (
                    target.cardShiftX === 0 &&
                    target.cardShiftY === 0 &&
                    target.cardRotateX === 0 &&
                    target.cardRotateY === 0 &&
                    target.cardScale === 1 &&
                    target.bgOffsetX === 0 &&
                    target.bgOffsetY === 0 &&
                    target.imgShiftX === 0 &&
                    target.imgShiftY === 0 &&
                    target.imgScale === 1
                ) {
                    card.classList.remove('is-tilting');
                }

                card._tiltFrame = null;
                return;
            }

            card._tiltFrame = window.requestAnimationFrame(step);
        };

        card._tiltFrame = window.requestAnimationFrame(step);
    }

    tiltCards.forEach((card) => {
        const image = card.querySelector('.game-img');

        if (!image) {
            return;
        }

        card._tiltCurrent = {
            cardShiftX: 0,
            cardShiftY: 0,
            cardRotateX: 0,
            cardRotateY: 0,
            cardScale: 1,
            bgOffsetX: 0,
            bgOffsetY: 0,
            imgShiftX: 0,
            imgShiftY: 0,
            imgScale: 1
        };
        resetTilt(card);
        applyTilt(card, card._tiltCurrent);

        card.addEventListener('mousemove', (event) => {
            const rect = card.getBoundingClientRect();
            const pointerX = (event.clientX - rect.left) / rect.width;
            const pointerY = (event.clientY - rect.top) / rect.height;

            const shiftX = (pointerX - 0.5) * 16;
            const shiftY = (pointerY - 0.5) * 12 - 4;
            const rotateY = (pointerX - 0.5) * 8;
            const rotateX = (0.5 - pointerY) * 6;
            const backgroundShiftX = (pointerX - 0.5) * 28;
            const backgroundShiftY = (pointerY - 0.5) * 22;
            const imageShiftX = (pointerX - 0.5) * 10;
            const imageShiftY = (pointerY - 0.5) * 7;

            card.classList.add('is-tilting');
            card._tiltTarget = {
                cardShiftX: shiftX,
                cardShiftY: shiftY,
                cardRotateX: rotateX,
                cardRotateY: rotateY,
                cardScale: 1.02,
                bgOffsetX: backgroundShiftX,
                bgOffsetY: backgroundShiftY,
                imgShiftX: imageShiftX,
                imgShiftY: imageShiftY,
                imgScale: 1.05
            };
            startTiltAnimation(card);
        });

        card.addEventListener('mouseleave', () => {
            resetTilt(card);
            startTiltAnimation(card);
        });
    });

    const uiTiltElements = document.querySelectorAll('.card, .shop-link, .nav a, .player, .currency-panel, .product-card');

    function getUiTiltConfig(element) {
        if (element.matches('.product-card')) {
            return { shiftX: 12, shiftY: 10, rotateX: 5, rotateY: 6, scale: 1.02, lift: -4 };
        }

        if (element.matches('.player')) {
            return { shiftX: 10, shiftY: 8, rotateX: 4, rotateY: 5, scale: 1.015, lift: -3 };
        }

        if (element.matches('.currency-panel')) {
            return { shiftX: 8, shiftY: 6, rotateX: 3, rotateY: 4, scale: 1.012, lift: -2 };
        }

        return { shiftX: 8, shiftY: 7, rotateX: 4, rotateY: 5, scale: 1.014, lift: -3 };
    }

    function resetUiTilt(element) {
        element._uiTiltTarget = {
            shiftX: 0,
            shiftY: 0,
            rotateX: 0,
            rotateY: 0,
            scale: 1
        };
    }

    function applyUiTilt(element, values) {
        element.style.setProperty('--ui-shift-x', `${values.shiftX}px`);
        element.style.setProperty('--ui-shift-y', `${values.shiftY}px`);
        element.style.setProperty('--ui-rotate-x', `${values.rotateX}deg`);
        element.style.setProperty('--ui-rotate-y', `${values.rotateY}deg`);
        element.style.setProperty('--ui-scale', `${values.scale}`);

        if (!element._uiDepthLayers) {
            return;
        }

        element._uiDepthLayers.forEach((layer) => {
            const depth = Number(layer.dataset.depth || 0);
            let factor = 0;

            if (depth === -1) {
                factor = -0.45;
            } else if (depth === 1) {
                factor = 0.45;
            } else if (depth === 2) {
                factor = 0.75;
            } else if (depth === 3) {
                factor = 1.05;
            }

            layer.style.setProperty('--depth-x', `${values.shiftX * factor}px`);
            layer.style.setProperty('--depth-y', `${values.shiftY * factor}px`);
        });
    }

    function startUiTiltAnimation(element) {
        if (element._uiTiltFrame) {
            return;
        }

        const step = () => {
            const current = element._uiTiltCurrent;
            const target = element._uiTiltTarget;
            const smoothing = 0.18;

            current.shiftX += (target.shiftX - current.shiftX) * smoothing;
            current.shiftY += (target.shiftY - current.shiftY) * smoothing;
            current.rotateX += (target.rotateX - current.rotateX) * smoothing;
            current.rotateY += (target.rotateY - current.rotateY) * smoothing;
            current.scale += (target.scale - current.scale) * smoothing;

            applyUiTilt(element, current);

            const isSettled =
                Math.abs(target.shiftX - current.shiftX) < 0.1 &&
                Math.abs(target.shiftY - current.shiftY) < 0.1 &&
                Math.abs(target.rotateX - current.rotateX) < 0.1 &&
                Math.abs(target.rotateY - current.rotateY) < 0.1 &&
                Math.abs(target.scale - current.scale) < 0.002;

            if (isSettled) {
                applyUiTilt(element, target);
                element._uiTiltCurrent = { ...target };

                if (
                    target.shiftX === 0 &&
                    target.shiftY === 0 &&
                    target.rotateX === 0 &&
                    target.rotateY === 0 &&
                    target.scale === 1
                ) {
                    element.classList.remove('is-ui-tilting');
                }

                element._uiTiltFrame = null;
                return;
            }

            element._uiTiltFrame = window.requestAnimationFrame(step);
        };

        element._uiTiltFrame = window.requestAnimationFrame(step);
    }

    uiTiltElements.forEach((element) => {
        const config = getUiTiltConfig(element);

        element._uiDepthLayers = Array.from(element.querySelectorAll('[data-depth]'));
        element._uiTiltCurrent = {
            shiftX: 0,
            shiftY: 0,
            rotateX: 0,
            rotateY: 0,
            scale: 1
        };

        resetUiTilt(element);
        applyUiTilt(element, element._uiTiltCurrent);

        element.addEventListener('mouseenter', () => {
            element.classList.add('is-ui-hovered', 'is-ui-tilting');
        });

        element.addEventListener('mousemove', (event) => {
            const rect = element.getBoundingClientRect();
            const pointerX = (event.clientX - rect.left) / rect.width;
            const pointerY = (event.clientY - rect.top) / rect.height;

            element.classList.add('is-ui-tilting');
            element._uiTiltTarget = {
                shiftX: (pointerX - 0.5) * config.shiftX,
                shiftY: (pointerY - 0.5) * config.shiftY + config.lift,
                rotateX: (0.5 - pointerY) * config.rotateX,
                rotateY: (pointerX - 0.5) * config.rotateY,
                scale: config.scale
            };
            startUiTiltAnimation(element);
        });

        element.addEventListener('mouseleave', () => {
            element.classList.remove('is-ui-hovered');
            resetUiTilt(element);
            startUiTiltAnimation(element);
        });
    });
})();
