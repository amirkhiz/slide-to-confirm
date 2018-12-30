(function () {

    /**
     * STCModal
     * @constructor
     */
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
        this.transitionEnd = _transitionSelect();

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
            this.options = _extendDefaults(defaults, arguments[0]);
        }

        if (this.options.autoOpen === true) this.open();
    };

    /**
     * Close Modal
     */
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

    /**
     * Open Modal
     */
    STCModal.prototype.open = function () {
        _buildOut.call(this);
        _initializeEvents.call(this);
        window.getComputedStyle(this.modal).height;
        this.modal.className = this.modal.className +
            (this.modal.offsetHeight > window.innerHeight ?
                ' slide-confirm-open slide-confirm-anchored' : ' slide-confirm-open');
        this.overlay.className = this.overlay.className + ' slide-confirm-open';
    };

    /**
     * Set the confirmed message
     * @param {string} message
     */
    STCModal.prototype.setConfirmationMessage = function (message) {
        this.options.confirmationMessage = message;

        if (this.confirmationMessageHolder) {
            this.confirmationMessageHolder.innerHTML = this.options.confirmationMessage;
        }
    };

    /**
     * Will set the confirm callback
     * @param {function} callback
     */
    STCModal.prototype.setConfirmCallback = function (callback) {
        this.options.confirmCallback = callback;
    };

    /*
     * Private Methods
     */

    /**
     * Build base elements
     * @private
     */
    function _buildOut() {
        var docFrag;

        // Create a DocumentFragment to build with
        docFrag = document.createDocumentFragment();

        // Create modal element
        this.modal = _createModalElm(this.modalId, this.options);

        // Create a close button
        this.modal.appendChild(this.closeButton = _createCloseButtonElm(this.options));

        // Create overlay and append it
        docFrag.appendChild(this.overlay = _createOverlayElm(this.options));

        // Create content area and append to modal
        this.modal.appendChild(_createContentAreaElm(this.options.content));

        // Create confirm slider and append to modal
        this.modal.appendChild(_createConfirmSliderHolderElm(this));

        // Append modal to DocumentFragment
        docFrag.appendChild(this.modal);

        // Append DocumentFragment to body
        document.body.appendChild(docFrag);
    }

    /**
     * Extend default options
     * @param {object} source
     * @param {object} properties
     * @return {*}
     * @private
     */
    function _extendDefaults(source, properties) {
        var property;

        for (property in properties) {
            if (properties.hasOwnProperty(property)) {
                source[property] = properties[property];
            }
        }

        return source;
    }

    /**
     * Initialize modal events
     * @private
     */
    function _initializeEvents() {

        if (this.closeButton) {
            this.closeButton.addEventListener('click', this.close.bind(this));
        }

        if (this.overlay) {
            this.overlay.addEventListener('click', this.close.bind(this));
        }

        if (this.confirmRange) {
            this.confirmRange.addEventListener('change', _confirmRangeChangeEvent.bind(this));
        }
    }

    /**
     * Confirm range change event callback
     * @param {object} event
     * @private
     */
    function _confirmRangeChangeEvent(event) {
        var slidePos = event.target.value;

        if (slidePos > 99) {
            // Remove Range input
            this.confirmRange.parentElement.removeChild(this.confirmRange);

            // Call confirmation callback method
            (typeof this.options.confirmCallback === 'function') && this.options.confirmCallback(slidePos, this);

            // Show confirmation message
            _fadeInEffect(this.confirmationMessageHolder);
        } else {
            event.target.value = 0;
        }
    }

    /**
     * Transition based on browser
     * @return {string}
     * @private
     */
    function _transitionSelect() {
        var el = document.createElement('div');

        if (el.style.WebkitTransition) return 'webkitTransitionEnd';
        if (el.style.OTransition) return 'oTransitionEnd';

        return 'transitionend';
    }

    /**
     * Fade out effect on element that sent as parameter
     * @param {HTMLElement} element
     * @private
     */
    function _fadeOutEffect(element) {
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

    /**
     * Fade in effect on element that sent as parameter
     * @param {HTMLElement} element
     * @private
     */
    function _fadeInEffect(element) {
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

    /**
     * Create modal element
     * @param {string} modalId
     * @param {object} options
     * @return {HTMLDivElement}
     * @private
     */
    function _createModalElm(modalId, options) {
        var modal = document.createElement('div');

        modal.className = 'slide-confirm-modal ' + options.className;
        modal.id = 'slide-confirm-modal-' + modalId;
        modal.style.minWidth = options.minWidth + 'px';
        modal.style.maxWidth = options.maxWidth + 'px';

        return modal;
    }

    /**
     * Create modal close button element
     * @param {object} options
     * @return {?HTMLButtonElement}
     * @private
     */
    function _createCloseButtonElm(options) {
        if (options.closeButton === false) {
            return null;
        }

        var closeButton = document.createElement('button');

        closeButton.className = 'slide-confirm-close close-button';
        closeButton.innerHTML = '&times;';

        return closeButton;
    }

    /**
     * Create Overlay element if requested in options
     * @param options
     * @return {?HTMLDivElement}
     * @private
     */
    function _createOverlayElm(options) {
        if (options.overlay === false) {
            return false;
        }

        var overlay = document.createElement('div');

        overlay.className = 'slide-confirm-overlay ' + options.className;

        return overlay;
    }

    /**
     * Create content area element based on sent content
     * @param content
     * @return {HTMLDivElement}
     * @private
     */
    function _createContentAreaElm(content) {
        var contentHolder = document.createElement('div');

        // If content is an HTML string, append the HTML string.
        // If content is a domNode, append its content.
        if (typeof content !== 'string') {
            content = content.innerHTML;
        }

        contentHolder.className = 'slide-confirm-content';
        contentHolder.innerHTML = content;

        return contentHolder;
    }

    /**
     * Create confirm slider holder element with related elements inside
     * @param {object} self
     * @return {HTMLDivElement}
     * @private
     */
    function _createConfirmSliderHolderElm(self) {
        var confirmSliderHolder = document.createElement('div');
        confirmSliderHolder.className = 'slide-confirm-slider';

        // Create confirm range element and append it to confirm slider element
        confirmSliderHolder.appendChild(self.confirmRange = _createConfirmRangeElm());

        // Create confirmation message and append it to confirm slider element
        confirmSliderHolder.appendChild(self.confirmationMessageHolder = _createConfirmMessageElm(self.options));

        return confirmSliderHolder;
    }

    /**
     * Create Input range element
     * @return {HTMLInputElement}
     * @private
     */
    function _createConfirmRangeElm() {
        var confirmRange = document.createElement('input');

        confirmRange.className = 'confirm-range-input';
        confirmRange.type = 'range';
        confirmRange.value = '0';
        confirmRange.min = '0';
        confirmRange.max = '100';

        return confirmRange;
    }

    /**
     * Create confirm message element
     * @param options
     * @return {HTMLParagraphElement}
     * @private
     */
    function _createConfirmMessageElm(options) {
        var confirmationMessageHolder = document.createElement('p');

        confirmationMessageHolder.className = 'confirmation-message-holder';
        confirmationMessageHolder.innerHTML = options.confirmationMessage;
        confirmationMessageHolder.style.display = 'none';
        confirmationMessageHolder.style.opacity = '0';

        return confirmationMessageHolder;
    }
}());