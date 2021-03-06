/**
 * Created by neomurderer on 07.05.14.
 */
var Worktime = function () {
    "use strict";

    var self = this;
    self.options = {
        itemSelector: "#worktime",
        input: null,
        shiftKey: false,
        prevItem: null,
        data:'{}',
        weekTitle:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
        weekTitleFull:["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
    }
    self.initGrid = function () {
        if(!self.options.data.length) self.options.data = '{}';
        self.options.data = JSON.parse(self.options.data);
        var grid = $("<div/>", {"class": "worktime_grid"}),
            week = 0,
            hours = 0,
            week_ul = null,
            week_li = null,
            week_label = $("<ul/>", {"class": "worktime_hours-label"});
        week_li = $("<li/>", {"class": "worktime_hours-label_text"})
        week_label.append(week_li)
        for (hours = 1; hours <= 24; hours++) {
            week_li = $("<li/>", {"class": "worktime_hours-label_text", "text": hours})
            week_label.append(week_li)
        }
        grid.append(week_label);
        for (week = 0; week < 7; week++) {
            week_ul = $("<ul/>", {"class": "worktime_week", "data-week": week})
            week_li = $("<li/>", {"class": "worktime_week-label",text: self.options.weekTitle[week]});
            week_ul.append(week_li)
            for (hours = 1; hours <= 24; hours++) {
                var selected = (jQuery.inArray(hours, self.options.data[self.options.weekTitleFull[week]]) >-1) ? true : false;
                week_li = $("<li/>", {"class": "worktime_hours", "data-hours": hours, "data-week": week,title:self.options.weekTitleFull[week]+" "+ hours + " hours"}).click(function () {
                    if(self.options.disabled) return;
                    self.toggleSelected(this)
                })
                if(week>4){
                    week_li.addClass("holiday");
                }
                if(selected){
                    week_li.addClass("selected");
                }
                week_ul.append(week_li)
            }
            grid.append(week_ul);
        }
        $("body").on("keydown", function (e) {
            switch (e.keyCode) {
                case 16:
                    self.options.shiftKey = true;
                    break;
            }
        })
        $("body").on("keyup", function (e) {
            switch (e.keyCode) {
                case 16:
                    self.options.shiftKey = false;
                    break;
            }
        })
        $(self.options.itemSelector).mousedown(function (event) {
            if(self.options.disabled) return;
            var state = $(event.target).hasClass("selected")
            $(self.options.itemSelector).find("li").hover(function (event) {
                if(state)
                {
                    $(event.target).removeClass("selected")
                }
                else {
                    $(event.target).addClass("selected")

                }
                return false;

            })
            return false;
        });
        $(self.options.itemSelector).mouseup(function (event) {
            $(self.options.itemSelector).find("li").unbind('mouseenter mouseleave');

            if(self.options.input && !self.options.disabled) {
                self.changeInput(self.getValues());
            }
            return false;
        });
        return grid;
    }
    self.toggleSelected = function (element) {
        if (self.options.shiftKey) {
            var newItem = {
                hours: $(element).data("hours"),
                week: $(element).data("week")
            }
            if (newItem.hours < self.options.prevItem.hours) {
                $('#worktime ul[data-week=' + newItem.week + '] li').slice(newItem.hours, self.options.prevItem.hours + 1).addClass("selected");
            }
            else {
                $('#worktime ul[data-week=' + newItem.week + '] li').slice(self.options.prevItem.hours, newItem.hours + 1).addClass("selected");

            }
        }
        else {
            $(element).toggleClass("selected");
        }
        self.options.prevItem = {
            hours: $(element).data("hours"),
            week: $(element).data("week")
        }
        if(self.options.input && !self.options.disabled) {
            self.changeInput(self.getValues());
        }
    }
    self.changeInput = function(data) {
        if(!Object.keys(data).length) return;
        $(self.options.input).val(JSON.stringify(data));
    }
};
Worktime.prototype = {

    init: function (settings) {
        "use strict";
        var parent = this;

        var options = parent.options = mergeRecursive(parent.options, settings);
        $(options.itemSelector).append(parent.initGrid());
        if(parent.options.input) {
            parent.changeInput(parent.getValues());
        }
    },
    getValues: function(){
        "use strict";
        var parent = this,
            data = {};
        $(parent.options.itemSelector).find("ul.worktime_week").each(function(i){
            if(!$(this).find("li.worktime_hours.selected").length) return;
            data[parent.options.weekTitleFull[$(this).data("week")]] = [];
            $(this).find("li.worktime_hours").each(function(i){
                if($(this).hasClass("selected"))
                {
                    data[parent.options.weekTitleFull[$(this).data("week")]].push($(this).data("hours"));
                }

            });
        });
        return data;
    }

}

function mergeRecursive(obj1, obj2) {
    "use strict";
    for (var p in obj2) {
        try {
            if (obj2[p].constructor === Object) {
                obj1[p] = mergeRecursive(obj1[p], obj2[p]);
            } else {
                obj1[p] = obj2[p];
            }
        } catch (e) {
            obj1[p] = obj2[p];
        }
    }

    return obj1;
}