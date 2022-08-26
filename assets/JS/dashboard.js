chrome.runtime.getPackageDirectoryEntry(function(root) {
    // let background = document.getElementsByClassName("container")[0];

    // background.style.height = document.innerHeight + "px";
    // background.style.width = document.innerWidth + "px";
    // background.style.backgroundColor = "green";

    root.getDirectory("wallpapers", {}, function(dirEntry) {
        dirEntry.createReader().readEntries(function(entries) {
            if(!entries.length) {
                // background.style.backgroundImage = "url('assets/IMG/Yasir.png')";
                document.body.style.backgroundImage = "url('assets/IMG/Yasir.png')";
            }
            image = entries[Math.floor(Math.random() * entries.length)];
            // background.style.backgroundImage = "url(" + "image/wallpapers/" + image.name + ")";
            document.body.style.backgroundImage = "url(" + "wallpapers/" + image.name + ")";
        });
    });
});

