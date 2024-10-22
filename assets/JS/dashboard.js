// Function to show quotes

// Wallpaper setup
(() => {
	const BODY = document.querySelector("body");
	chrome.storage.local.get({ Wallpapers: [] }, ({ Wallpapers }) => {
		const setWallpaper = (wallpapers) => {
			const randomWallpaper = wallpapers[Math.floor(Math.random() * wallpapers.length)];
			const imageUrl = chrome.runtime.getURL(`wallpapers/${randomWallpaper}`);
			BODY.style.backgroundImage = `url("${imageUrl}")`;
			console.log(`Total wallpapers Indexed: ${Wallpapers.length}\nSetting as Background: ${randomWallpaper}`);
		};

		if (Wallpapers.length > 0) return setWallpaper(Wallpapers);

		chrome.runtime.getPackageDirectoryEntry((root) => {
			root.getDirectory("wallpapers", {}, (dirEntry) => {
				const reader = dirEntry.createReader();
				let readFiles = [];
				const readEntries = () => {
					reader.readEntries((entries) => {
						entries.length > 0
							? ((readFiles = [...readFiles, ...entries]), readEntries())
							: chrome.storage.local.set({ Wallpapers: readFiles.map((file) => file.name) }, () => {
									setWallpaper(readFiles.map((file) => file.name));
							  });
					});
				};
				readEntries();
			});
		});
	});
})();
