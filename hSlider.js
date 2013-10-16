(function ($) {
    'use strict';
    var container = null,
        Slider = {},
        currentValue = null,
        $d = $(document);
    Slider = {
        init: function (options) {
            this.opts = options;
            this.handle = container.find('a');
            this.bounds = this.getBounds(this.handle, container);
            this.handle.css({'-webkit-touch-callout': 'none', '-webkit-user-select': 'none', '-khtml-user-select': 'none', '-moz-user-select': 'none', '-ms-user-select': 'none', 'user-select': 'none'});
            this.bindEvents();
            $d.trigger('mousemove');
        },
        bindEvents: function () {
            var local = this,
                initValue = 0,
                min = currentValue > 0 ? currentValue : local.opts.min,
                left = 0,
                mouseDown = false,
                init = false,
                posX   = 0,
                innerX = 0;
            container.css('cursor', 'pointer').on('click', function (e) {
                posX = e.pageX - innerX;
                var m = {
                        left: posX < local.bounds.left ? local.bounds.left : (posX > local.bounds.right ? local.bounds.right : posX)
                    },
                    percent = local.getPercentageByValue(posX, {min: local.bounds.left, max: local.bounds.right}),
                    value = local.getValueByPercentage(percent, local.opts.interval);
                if (value >= local.opts.min) {
                    local.handle.offset(m);
                    currentValue = value;
                    if (typeof local.opts.slide === 'function')
                        local.opts.slide.apply(this, [value, percent, m.left]);
                }
            });
            local.handle.off().on("mousedown", function (e) {
                innerX = e.pageX - $(this).offset().left;
                mouseDown = true;
                e.preventDefault();
            }).on("mouseup", function () {
                mouseDown = false;
            });
            $d.off().on("mousemove", function (e) {
                if (mouseDown) {
                    posX = e.pageX - innerX;
                    var m = {
                            left: posX < local.bounds.left ? local.bounds.left : (posX > local.bounds.right ? local.bounds.right : posX)
                        },
                        percent = local.getPercentageByValue(posX, {min: local.bounds.left, max: local.bounds.right}),
                        value = local.getValueByPercentage(percent, local.opts.interval);
                    if (value >= local.opts.min) {
                        local.handle.offset(m);
                        currentValue = value;
                        if (typeof local.opts.slide === 'function')
                            local.opts.slide.apply(this, [value, percent, m.left]);
                    }
                }
                if (init === false) {
                    init = true;
                    initValue = local.getPercentageByValue(min, local.opts.interval);
                    left = local.getValueByPercentage(initValue, {min: local.bounds.left, max: local.bounds.right});
                    local.handle.offset({
                        left: left
                    });
                    if (typeof local.opts.slide === 'function')
                        local.opts.slide.apply(this, [min, initValue, left]);
                }
            }).on('mouseup', function (e) {
                    mouseDown = false;
                e.preventDefault();
            });
        },
        getBounds: function (handle, container) {
            var offset = container.offset();
            return {
                bottom: offset.top + container.height() - handle.width(),
                left: offset.left,
                right: offset.left + container.width() - handle.width(),
                top: offset.top - handle.offset().top
            };
        },
        getPercentageByValue: function (value, range) {
            var percentage = 100 * (value - range.min) / (range.max - range.min);
            percentage = percentage > 100 ? 100 : percentage;
            percentage = percentage < 0 ? 0 : percentage;
            return Math.round(percentage);
        },
        getValueByPercentage: function (percent, range) {
            return Math.round((((range.max - range.min ) / 100) * percent) + range.min);
        },
        destroy: function () {
            this.handle.off();
            $d.off('mousemove mouseup');
        }
    };
    $.fn.extend({
        simpleSlider: function (options) {
            container = this;
            Slider.init(options);
            $(window).resize(function () {
                Slider.destroy();
                Slider.init(options);
            });
        }
    });
}(jQuery));
