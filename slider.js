/**
 * Created with IntelliJ IDEA.
 * User: adi
 * Date: 10/17/13
 * Time: 11:37 AM
 * To change this template use File | Settings | File Templates.
 * global jQuery
 */
(function ($) {
    var $d = $(document),
        $w = $(window);
    function Slider (opts) {
        var self = this,
            state = {
                innerX: 0,
                innerY: 0,
                mouseDown: false,
                currentValue: false,
                init: false
            },
            container = opts.container,
            handle = container.find('a'),
            bounds = {};
        this.setBounds = function () {
            var offset = container.offset();
            return {
                bottom: offset.top + container.height() - handle.height(),
                left: offset.left,
                right: offset.left + container.width() - handle.width(),
                top: offset.top
            };
        };
        this.getPercentageByValue = function (value, range) {
            var percentage = 100 * (value - range.min) / (range.max - range.min);
            percentage = percentage > 100 ? 100 : percentage;
            percentage = percentage < 0 ? 0 : percentage;
            return Math.round(percentage);
        };
        this.getValueByPercentage = function (percent, range) {
            return Math.round((((range.max - range.min ) / 100) * percent) + range.min);
        };
        this.handleMove = function (position) {
            var m = {},
                percent = 0,
                value = 0;
            if(opts.direction === 'horizontal') {
                percent = self.getPercentageByValue(position.x, {min: bounds.left, max: bounds.right});
                value = self.getValueByPercentage(percent, opts.interval);
                m.left = position.x < bounds.left ? bounds.left : (position.x > bounds.right ? bounds.right : position.x);
            }
            if(opts.direction === 'vertical') {
                percent = self.getPercentageByValue(position.y, {min: bounds.top, max: bounds.bottom});
                value = self.getValueByPercentage(percent, opts.interval);
                m.top = position.y < bounds.top ? bounds.top : (position.y > bounds.bottom ? bounds.bottom : position.y);
            }
            if (value >= opts.limits.min) {
                handle.offset(m);
                state.currentValue = value;
                if (typeof opts.slide === 'function')
                    opts.slide.apply(this, [container, value, percent, m]);
            }
        };
        this.bindEvents = function () {
            container.css('cursor', 'pointer').on('click', function (e) {
                self.handleMove({x: e.pageX - state.innerX, y: e.pageY - state.innerY});
            });
            handle.off().on("mousedown", function (e) {
                state.innerX = e.pageX - handle.offset().left;
                state.innerY = e.pageY - handle.offset().top;
                state.mouseDown = true;
                e.preventDefault();
            }).on("mouseup", function () {
                state.mouseDown = false;
            });
            $d.on("mousemove", function (e) {
                if (state.mouseDown) {
                    self.handleMove({x: e.pageX - state.innerX,y: e.pageY - state.innerY });
                }
                if (state.init === false) {
                    state.init = true;
                    self.handleMove({
                        x: self.getValueByPercentage(self.getPercentageByValue(state.currentValue || container.find('input').val() || opts.limits.min, opts.interval), {min: bounds.left, max: bounds.right}),
                        y: self.getValueByPercentage(self.getPercentageByValue(state.currentValue || container.find('input').val() || opts.limits.min, opts.interval), {min: bounds.top, max: bounds.bottom})
                    });
                }
            }).on('mouseup', function (e) {
                state.mouseDown = false;
                e.preventDefault();
            });
            $w.on('resize', function () {
                bounds = self.setBounds();
                state.init = false;
                $d.trigger('mousemove');
            });
        };
        this.construct = function () {
            bounds = self.setBounds();
            self.bindEvents();
            $d.trigger('mousemove');
        };
    }
    $.fn.extend({
        simpleSlider: function (options) {
            return this.each(function () {
                var opts = $.extend({}, {container: $(this)}, options);
                opts.direction = opts.container.hasClass('vertical') ? 'vertical' : 'horizontal';
                (new Slider(opts)).construct();
            });
        }
    });
}(jQuery));
