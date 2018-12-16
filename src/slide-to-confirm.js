(function () {

    // STCModal constructor
    this.STCModal = function () {
        // Unique id for ever new created modal
        this.modalId = Date.now();

        // Create global element references
        this.closeButton = null;
        this.modal = null;
        this.overlay = null;
        this.confirmRange = null;
        this.confirmationMessageHolder = null;

        // Determine proper prefix
        this.transitionEnd = transitionSelect();

        // Define option defaults
        var defaults = {
            autoOpen: false,
            className: 'fade-and-drop',
            closeButton: true,
            content: '',
            maxWidth: 600,
            minWidth: 280,
            overlay: true,
            confirmationMessage: 'Successfully Done.',
            confirmCallback: null,
        };

        // Create options by extending defaults with the passed in arguments
        if (arguments[0] && typeof arguments[0] === 'object') {
            this.options = extendDefaults(defaults, arguments[0]);
        }

        if (this.options.autoOpen === true) this.open();
    };

    // Public Methods

    STCModal.prototype.close = function () {
        var _ = this;

        this.modal.className = this.modal.className.replace(' slide-confirm-open', '');
        this.overlay.className = this.overlay.className.replace(' slide-confirm-open', '');

        this.modal.addEventListener(this.transitionEnd, function () {
            _.modal.parentNode.removeChild(_.modal);
        });

        this.overlay.addEventListener(this.transitionEnd, function () {
            if (_.overlay.parentNode) _.overlay.parentNode.removeChild(_.overlay);
        });
    };

    STCModal.prototype.open = function () {
        buildOut.call(this);
        initializeEvents.call(this);
        window.getComputedStyle(this.modal).height;
        this.modal.className = this.modal.className +
            (this.modal.offsetHeight > window.innerHeight ?
                ' slide-confirm-open slide-confirm-anchored' : ' slide-confirm-open');
        this.overlay.className = this.overlay.className + ' slide-confirm-open';
    };

    STCModal.prototype.setConfirmationMessage = function (message) {
        this.options.confirmationMessage = message;

        if (this.confirmationMessageHolder) {
            this.confirmationMessageHolder.innerHTML = this.options.confirmationMessage;
        }
    };

    STCModal.prototype.setConfirmCallback = function (callback) {
        this.options.confirmCallback = callback;
    };

    // Private Methods

    function buildOut() {

        var content, contentHolder, confirmSliderHolder, docFrag;

        /*
         * If content is an HTML string, append the HTML string.
         * If content is a domNode, append its content.
         */

        if (typeof this.options.content === 'string') {
            content = this.options.content;
        } else {
            content = this.options.content.innerHTML;
        }

        // Create a DocumentFragment to build with
        docFrag = document.createDocumentFragment();

        // Create modal element
        this.modal = document.createElement('div');
        this.modal.className = 'slide-confirm-modal ' + this.options.className;
        this.modal.id = 'slide-confirm-modal-' + this.modalId;
        this.modal.style.minWidth = this.options.minWidth + 'px';
        this.modal.style.maxWidth = this.options.maxWidth + 'px';

        // If closeButton option is true, add a close button
        if (this.options.closeButton === true) {
            this.closeButton = document.createElement('button');
            this.closeButton.className = 'slide-confirm-close close-button';
            this.closeButton.innerHTML = '&times;';
            this.modal.appendChild(this.closeButton);
        }

        // If overlay is true, add one
        if (this.options.overlay === true) {
            this.overlay = document.createElement('div');
            this.overlay.className = 'slide-confirm-overlay ' + this.options.className;
            docFrag.appendChild(this.overlay);
        }

        // Create content area and append to modal
        contentHolder = document.createElement('div');
        contentHolder.className = 'slide-confirm-content';
        contentHolder.innerHTML = content;
        this.modal.appendChild(contentHolder);

        // Create content area and append to modal
        confirmSliderHolder = document.createElement('div');
        confirmSliderHolder.className = 'slide-confirm-slider';

        this.confirmRange = document.createElement('input');
        this.confirmRange.className = 'confirm-range-input';
        this.confirmRange.type = 'range';
        this.confirmRange.value = '0';
        this.confirmRange.min = '0';
        this.confirmRange.max = '100';
        confirmSliderHolder.appendChild(this.confirmRange);

        // Create confirmation message
        this.confirmationMessageHolder = document.createElement('p');
        this.confirmationMessageHolder.className = 'confirmation-message-holder';
        this.confirmationMessageHolder.innerHTML = this.options.confirmationMessage;
        this.confirmationMessageHolder.style.display = 'none';
        this.confirmationMessageHolder.style.opacity = '0';
        confirmSliderHolder.appendChild(this.confirmationMessageHolder);

        this.modal.appendChild(confirmSliderHolder);

        // Append modal to DocumentFragment
        docFrag.appendChild(this.modal);

        // Append DocumentFragment to body
        document.body.appendChild(docFrag);
    }

    function extendDefaults(source, properties) {
        var property;

        for (property in properties) {
            if (properties.hasOwnProperty(property)) {
                source[property] = properties[property];
            }
        }

        return source;
    }

    function initializeEvents() {

        if (this.closeButton) {
            this.closeButton.addEventListener('click', this.close.bind(this));
        }

        if (this.overlay) {
            this.overlay.addEventListener('click', this.close.bind(this));
        }

        if (this.confirmRange) {
            this.confirmRange.addEventListener('change', confirmRangeChangeEvent.bind(this));
        }
    }

    function confirmRangeChangeEvent(event) {
        var slidePos = event.target.value;

        if (slidePos > 99) {
            // Remove Range input
            this.confirmRange.parentElement.removeChild(this.confirmRange);

            // Call confirmation callback method
            (typeof this.options.confirmCallback === 'function') && this.options.confirmCallback(slidePos, this);

            // Show confirmation message
            fadeInEffect(this.confirmationMessageHolder);
        } else {
            event.target.value = 0;
        }
    }

    function transitionSelect() {
        var el = document.createElement('div');

        if (el.style.WebkitTransition) return 'webkitTransitionEnd';
        if (el.style.OTransition) return 'oTransitionEnd';

        return 'transitionend';
    }

    function fadeOutEffect(element) {
        var fadeTarget = element;

        var fadeEffect = setInterval(function () {
            if (!fadeTarget.style.opacity) {
                fadeTarget.style.opacity = 1;
            }

            if (fadeTarget.style.opacity > 0) {
                fadeTarget.style.opacity -= fadeTarget.style.opacity * 0.1;
            } else {
                fadeTarget.style.display = 'none';
                clearInterval(fadeEffect);
            }
        }, 30);
    }

    function fadeInEffect(element) {
        var fadeTarget = element;
        var opacity = 0.1;

        fadeTarget.style.display = 'block';

        var fadeEffect = setInterval(function () {
            if (!fadeTarget.style.opacity) {
                fadeTarget.style.opacity = 0;
            }

            if (opacity < 1) {
                opacity += opacity * 0.1;
                fadeTarget.style.opacity = opacity;
            } else {
                clearInterval(fadeEffect);
            }
        }, 10);
    }
}());