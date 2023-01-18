// Sticky Plugin v1.0.0 for jQuery
// =============
// Author: Anthony Garand
// Improvements by German M. Bravo (Kronuz) and Ruud Kamphuis (ruudk)
// Improvements by Leonardo C. Daronco (daronco)
// Created: 2/14/2011
// Date: 2/12/2012
// Website: http://labs.anthonygarand.com/sticky
// Description: Makes an element on the page stick on the screen as you scroll
//       It will only set the 'top' and 'position' of your element, you
//       might need to adjust the width in some cases.

(function ($) {
  const defaults = {
    topSpacing: 0,
    bottomSpacing: 0,
    className: 'is-sticky',
    wrapperClassName: 'sticky-wrapper',
    center: false,
    getWidthFrom: '',
    responsiveWidth: false
  }
  const $window = $(window)
  const $document = $(document)
  const sticked = []
  let windowHeight = $window.height()
  const scroller = function () {
    const scrollTop = $window.scrollTop()
    const documentHeight = $document.height()
    const dwh = documentHeight - windowHeight
    const extra = (scrollTop > dwh) ? dwh - scrollTop : 0

    for (let i = 0; i < sticked.length; i++) {
      const s = sticked[i]
      const elementTop = s.stickyWrapper.offset().top
      const etse = elementTop - s.topSpacing - extra

      if (scrollTop <= etse) {
        if (s.currentTop !== null) {
          s.stickyElement
            .css('width', '')
            .css('position', '')
            .css('top', '')
          s.stickyElement.trigger('sticky-end', [s]).parent().removeClass(s.className)
          s.currentTop = null
        }
      } else {
        let newTop = documentHeight - s.stickyElement.outerHeight() -
            s.topSpacing - s.bottomSpacing - scrollTop - extra
        if (newTop < 0) {
          newTop = newTop + s.topSpacing
        } else {
          newTop = s.topSpacing
        }
        if (s.currentTop != newTop) {
          s.stickyElement
            .css('width', s.stickyElement.width())
            .css('position', 'fixed')
            .css('top', newTop)

          if (typeof s.getWidthFrom !== 'undefined') {
            s.stickyElement.css('width', $(s.getWidthFrom).width())
          }

          s.stickyElement.trigger('sticky-start', [s]).parent().addClass(s.className)
          s.currentTop = newTop
        }
      }
    }
  }
  const resizer = function () {
    windowHeight = $window.height()

    for (let i = 0; i < sticked.length; i++) {
      const s = sticked[i]
      if (typeof s.getWidthFrom !== 'undefined' && s.responsiveWidth === true) {
        s.stickyElement.css('width', $(s.getWidthFrom).width())
      }
    }
  }
  const methods = {
    init: function (options) {
      const o = $.extend({}, defaults, options)
      return this.each(function () {
        const stickyElement = $(this)

        const stickyId = stickyElement.attr('id')
        const wrapperId = stickyId ? stickyId + '-' + defaults.wrapperClassName : defaults.wrapperClassName
        const wrapper = $('<div></div>')
          .attr('id', stickyId + '-sticky-wrapper')
          .addClass(o.wrapperClassName)
        stickyElement.wrapAll(wrapper)

        if (o.center) {
          stickyElement.parent().css({ width: stickyElement.outerWidth(), marginLeft: 'auto', marginRight: 'auto' })
        }

        if (stickyElement.css('float') == 'right') {
          stickyElement.css({ float: 'none' }).parent().css({ float: 'right' })
        }

        const stickyWrapper = stickyElement.parent()
        stickyWrapper.css('height', stickyElement.outerHeight())
        sticked.push({
          topSpacing: o.topSpacing,
          bottomSpacing: o.bottomSpacing,
          stickyElement,
          currentTop: null,
          stickyWrapper,
          className: o.className,
          getWidthFrom: o.getWidthFrom,
          responsiveWidth: o.responsiveWidth
        })
      })
    },
    update: scroller,
    unstick: function (options) {
      return this.each(function () {
        const unstickyElement = $(this)

        let removeIdx = -1
        for (let i = 0; i < sticked.length; i++) {
          if (sticked[i].stickyElement.get(0) == unstickyElement.get(0)) {
            removeIdx = i
          }
        }
        if (removeIdx != -1) {
          sticked.splice(removeIdx, 1)
          unstickyElement.unwrap()
          unstickyElement.removeAttr('style')
        }
      })
    }
  }

  // should be more efficient than using $window.scroll(scroller) and $window.resize(resizer):
  if (window.addEventListener) {
    window.addEventListener('scroll', scroller, false)
    window.addEventListener('resize', resizer, false)
  } else if (window.attachEvent) {
    window.attachEvent('onscroll', scroller)
    window.attachEvent('onresize', resizer)
  }

  $.fn.sticky = function (method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1))
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments)
    } else {
      $.error('Method ' + method + ' does not exist on jQuery.sticky')
    }
  }

  $.fn.unstick = function (method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1))
    } else if (typeof method === 'object' || !method) {
      return methods.unstick.apply(this, arguments)
    } else {
      $.error('Method ' + method + ' does not exist on jQuery.sticky')
    }
  }
  $(function () {
    setTimeout(scroller, 0)
  })
})(jQuery)
