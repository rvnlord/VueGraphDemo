import enumerable from "linq";
import deepEquals from "fast-deep-equal";
import moment from "moment";

Object.defineProperty(Array.prototype, "asEnumerable", {
    value: function asEnumerable() {
        return enumerable.from(this);
    },
    writable: true,
    configurable: true
});

Object.defineProperty(Object.prototype, "equals", {
    value: function equals(that) {
        return deepEquals(this, that);
    },
    writable: true,
    configurable: true
});

function pad(n, width, z) {
    z = z || "0";
    n = n + "";
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

Object.defineProperty(Object.prototype, "unixTsToDateString", {
    value: function unixTsToDateString() {
        const d = new Date(parseFloat(this));
        return moment(d).format("DD-MM-yyyy HH:mm");
        //const year = d.getFullYear();
        //const month = d.getMonth() + 1;
        //const day = d.getDate();
        //const hour = d.getHours();
        //const min = d.getMinutes();
        //const sec = d.getSeconds();
        //const time = `${pad(day, 2)}-${pad(month, 2)}-${pad(year, 4)} ${pad(hour, 2)}:${pad(min, 2)}:${pad(sec, 2)}`;
        //return time;
    },
    writable: true,
    configurable: true
});

//module.exports = Extensions;

