/* Ruby Booking – media picker for service / staff images */
(function () {
	if (!window.wp || !wp.media) return;
	document.querySelectorAll('.rb-photo').forEach(function (box) {
		var pick = box.querySelector('.rb-pick'), clear = box.querySelector('.rb-clear');
		var input = box.querySelector('input[type=hidden]'), prev = box.querySelector('.rb-photo-prev');
		pick.addEventListener('click', function () {
			var frame = wp.media({ title: pick.getAttribute('data-title') || 'Chọn ảnh', multiple: false, library: { type: 'image' } });
			frame.on('select', function () {
				var a = frame.state().get('selection').first().toJSON();
				input.value = a.id;
				var url = (a.sizes && a.sizes.thumbnail) ? a.sizes.thumbnail.url : a.url;
				prev.innerHTML = '<img src="' + url + '" alt="">';
			});
			frame.open();
		});
		clear.addEventListener('click', function () { input.value = 0; prev.innerHTML = ''; });
	});
})();
