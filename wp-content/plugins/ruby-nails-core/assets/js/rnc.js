(function () {
  var list = document.getElementById('rnc-service-list');
  if (!list || !window.RNC) return;
  fetch(RNC.api + 'services')
    .then(function (r) { return r.json(); })
    .then(function (rows) {
      if (!rows.length) { list.innerHTML = '<li>Chưa có dịch vụ – hãy import database/sample_data.sql</li>'; return; }
      list.innerHTML = rows.map(function (s) {
        return '<li>' + s.Service_Name + ' – ' + Number(s.Price).toLocaleString('vi-VN') + 'đ · ' + s.Duration_Min + ' phút</li>';
      }).join('');
    })
    .catch(function () { list.innerHTML = '<li>Không tải được dịch vụ.</li>'; });
})();
