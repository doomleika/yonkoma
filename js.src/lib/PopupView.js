var isMobileDevice = require('./isMobileDevice.js');

PopupView = (function() {
    function PopupView(default_parent) {
        this.default_parent = default_parent;
        this._popupStack = [];
        this._popupArea = this.default_parent.querySelector(".popup_area");
        this._popupStyle = null;
        this._popupMarginHeight = -1;
        this._currentX = 0;
        this._currentY = 0;
        this._waitMs = isMobileDevice() ? 0 : 50;
        this._first = true;
        return;
    }

    PopupView.prototype._on_click = function(e) {
        var id = -1;
        for (var i = 0; i < this._popupStack.length; i++) {
            var top = $(this._popupStack[i].popup).position().top;
            var bottom = top + $(this._popupStack[i].popup).height();
            if (top <= e.clientY && e.clientY <= bottom) id = i;
        }

        if (id == -1) {
            this._remove(true);
        }
    };

    PopupView.prototype._on_mousemove = function(e) {
        this._currentX = e.clientX;
        this._currentY = e.clientY;
    };

    /**
    @method show
    @param {Element} popup
    @param {Number} mouseX
    @param {Number} mouseY
    @param {Element} source
    */
    PopupView.prototype.show = function(popup, mouseX, mouseY, source) {
        var popupInfo;
        var isMobile = isMobileDevice();
        this.popup = popup;
        this.mouseX = mouseX;
        this.mouseY = mouseY;
        this.source = source;

        if (this._popupStack.length > 0) {
            popupInfo = this._popupStack[this._popupStack.length - 1];
            if (Object.is(this.source, popupInfo.source)) {
                return;
            }
        }

        if (this.source.closest(".popup")) {
            //			this.source.closest(".popup").classList.add("active");
            this._remove(false);
        } else {
            this._remove(true);
        }

        //rendering
        var windowHeight = $(window).innerHeight();
        var space = {
            left: this.mouseX,
            right: $(window).innerWidth() - this.mouseX,
            top: this.mouseY,
            bottom: windowHeight - this.mouseY
        };
        if (isMobile) {
            this.popup.style.left = '0';
            this.popup.style.top = '0';
            this.popup.style.right = '0';
            this.popup.style.width = '100%';
            var outerHeight = this._getOuterHeight(this.popup);
            var spaceUp = this.mouseY - 10;
            if (outerHeight <= spaceUp)
                this.popup.style.top = (this.mouseY - 10 - outerHeight) + 'px';
            this.popup.style.maxHeight = '85%';
        } else {
            var margin = 10;
            if (space.right >= space.left || space.right > 400) {
                this.popup.style.left = (space.left + margin) + "px";
                this.popup.style.maxWidth = (space.right - margin * 2) + "px";
            } else {
                this.popup.style.right = (space.right + margin) + "px";
                this.popup.style.maxWidth = (space.left - margin * 2) + "px";
            }
            var outerHeight = this._getOuterHeight(this.popup);
            var top = Math.max(this.mouseY - margin, 0);
            if (space.bottom < 2 * margin + outerHeight)
                top = Math.max(0, windowHeight - 2 * margin - outerHeight);
            this.popup.style.top = top + "px";
            this.popup.style.maxHeight = (windowHeight - top - margin) + "px";
        }

        if (this._first) {
            this._first = false;
            this._currentX = this.mouseX;
            this._currentY = this.mouseY;
            this.default_parent.addEventListener("mousemove", (function(_this) {
                return function(e) {
                    return _this._on_mousemove(e);
                };
            })(this));
            if (isMobile) {
                this.default_parent.addEventListener("click", (function(_this) {
                    return function(e) {
                        return _this._on_click(e);
                    };
                })(this));
            }
        }

        this.source.classList.add("popup_source");
        this.source.setAttribute("stack-index", this._popupStack.length);
        this.popup.classList.add("popup");
        this.popup.setAttribute("stack-index", this._popupStack.length);
        this.popup.style.zIndex = (this._popupStack.length + 5).toString();

        eventListenerInfo = {
            mouseenter: (function(_this) {
                return function(e) {
                    return _this._on_mouseenter(e.currentTarget);
                }
            })(this),

            mouseleave: (function(_this) {
                return function(e) {
                    return _this._on_mouseleave(e.currentTarget);
                }
            })(this)
        };
        if (!isMobile) {
            this.popup.addEventListener("mouseenter", (function(_this) {
                return function(e) {
                    return _this._on_mouseenter(e.currentTarget);
                };
            })(this));
            this.popup.addEventListener("mouseleave", (function(_this) {
                return function(e) {
                    return _this._on_mouseleave(e.currentTarget);
                };
            })(this));
            this.source.addEventListener("mouseenter", eventListenerInfo.mouseenter);
            this.source.addEventListener("mouseleave", eventListenerInfo.mouseleave);
        }
        popupInfo = {
            source: this.source,
            popup: this.popup,
            eventListener: eventListenerInfo
        };

        var elm = document.elementFromPoint(this._currentX, this._currentY);
        if (Object.is(elm, this.source)) {
            this._popupStack.push(popupInfo);
            this._popupArea.appendChild(popupInfo.popup);
            this._activateNode();
        } else {
            this.source.removeEventListener("mouseenter", eventListenerInfo.mouseenter);
            this.source.removeEventListener("mouseleave", eventListenerInfo.mouseleave);
        }
    };

    /**
    @method _remove
    @param {Boolean} forceRemove
    */
    PopupView.prototype._remove = function(forceRemove) {
        var popupInfo;
        while (this._popupStack.length > 0) {
            popupInfo = this._popupStack[this._popupStack.length - 1];
            if (forceRemove === false && (popupInfo.source.classList.contains("active") || popupInfo.popup.classList.contains("active"))) {
                break;
            }
            popupInfo.source.classList.remove("popup_source");
            popupInfo.source.removeAttribute("stack-index");
            popupInfo.source.removeEventListener("mouseenter", popupInfo.eventListener.mouseenter);
            popupInfo.source.removeEventListener("mouseleave", popupInfo.eventListener.mouseleave);
            this._popupArea.removeChild(popupInfo.popup);
            this._popupStack.pop();
        }
    };

    /**
    @method _on_mouseenter
    @param {Object} target
    */
    PopupView.prototype._on_mouseenter = function(target) {
        var stackIndex;
        target.classList.add("active");
        stackIndex = target.getAttribute("stack-index");
        if (target.classList.contains("popup")) {
            this._popupStack[stackIndex].source.classList.remove("active");
        } else if (target.classList.contains("popup_source")) {
            this._popupStack[stackIndex].popup.classList.remove("active");
        }
        if (this._popupStack.length - 1 > stackIndex) {
            this._popupStack[this._popupStack.length - 1].source.classList.remove("active");
            this._popupStack[this._popupStack.length - 1].popup.classList.remove("active");
            setTimeout((function(_this) {
                return function() {
                    return _this._remove(false);
                };
            })(this), this._waitMs);
        }
    };

    /**
    @method _on_mouseleave
    @param {Object} target
     */
    PopupView.prototype._on_mouseleave = function(target) {
        target.classList.remove("active");
        setTimeout((function(_this) {
            return function() {
                return _this._remove(false);
            };
        })(this), this._waitMs);
    };

    /**
    @method _activateNode
    */
    PopupView.prototype._activateNode = function() {
        var elm;
        elm = document.elementFromPoint(this._currentX, this._currentY);
        if (Object.is(elm, this.source)) {
            this.source.classList.add("active");
        } else if (Object.is(elm, this.popup) || Object.is(elm.closest(".popup"), this.popup)) {
            this.popup.classList.add("active");
        } else if (elm.classList.contains("popup_source") || elm.classList.contains("popup")) {
            elm.classList.add("active");
        } else if (elm.closest(".popup")) {
            elm.closest(".popup").classList.add("active");
        } else {
            this._popupStack[this._popupStack.length - 1].source.classList.remove("active");
            this._popupStack[this._popupStack.length - 1].popup.classList.remove("active");
            setTimeout((function(_this) {
                return function() {
                    return _this._remove(false);
                };
            })(this), this._waitMs);
        }
    };

    /**
    @method _getOuterHeight
    @param {Object} elm
    @param {Boolean} margin
    */
    PopupView.prototype._getOuterHeight = function(elm) {
        var tmp = elm.style.top;
        var re = 0;
        var cls = elm.className;
        //test height
        elm.style.top = '0';
        $(elm).addClass('popup');
        this._popupArea.appendChild(elm);
        re = elm.clientHeight;
        this._popupArea.removeChild(elm);
        //recover
        elm.style.top = tmp;
        elm.className = cls;
        return re;
    };
    return PopupView;
})();

module.exports = PopupView;