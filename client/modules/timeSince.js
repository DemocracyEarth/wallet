let timeAgo = (date) => {
    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
        return interval + " " + TAPi18n.__('years-ago');
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " " + TAPi18n.__('months-ago');
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " " + TAPi18n.__('days-ago');;
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " " + TAPi18n.__('hours-ago');;
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " " + TAPi18n.__('minutes-ago');
    }
    return Math.floor(seconds) + " " + TAPi18n.__('seconds-ago');;
}

Modules.client.timeSince = timeAgo;
