/* Ruby Booking – hệ thống quản lý lịch hẹn nội bộ (/quan-ly/) */
(function () {
  'use strict';
  const B = window.RBP;
  const app = document.getElementById('rbp-app');
  if (!B || !app) return;
  const ICON = {"cal": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12\" /> <path d=\"M16 3l0 4\" /> <path d=\"M8 3l0 4\" /> <path d=\"M4 11l16 0\" /> <path d=\"M8 15h2v2h-2l0 -2\" /></svg>", "inbox": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12\" /> <path d=\"M4 13h3l3 3h4l3 -3h3\" /></svg>", "plus": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 5l0 14\" /> <path d=\"M5 12l14 0\" /></svg>", "users": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 7a4 4 0 1 0 8 0a4 4 0 1 0 -8 0\" /> <path d=\"M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2\" /> <path d=\"M16 3.13a4 4 0 0 1 0 7.75\" /> <path d=\"M21 21v-2a4 4 0 0 0 -3 -3.85\" /></svg>", "chart": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 13a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -6\" /> <path d=\"M15 9a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -10\" /> <path d=\"M9 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -14\" /> <path d=\"M4 20h14\" /></svg>", "shield": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 3a12 12 0 0 0 8.5 3a12 12 0 0 1 -8.5 15a12 12 0 0 1 -8.5 -15a12 12 0 0 0 8.5 -3\" /> <path d=\"M11 11a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" /> <path d=\"M12 12l0 2.5\" /></svg>", "settings": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065\" /> <path d=\"M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0\" /></svg>", "external": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 6h-6a2 2 0 0 0 -2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-6\" /> <path d=\"M11 13l9 -9\" /> <path d=\"M15 4h5v5\" /></svg>", "logout": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2\" /> <path d=\"M9 12h12l-3 -3\" /> <path d=\"M18 15l3 -3\" /></svg>", "loader": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 3a9 9 0 1 0 9 9\" /></svg>", "left": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M15 6l-6 6l6 6\" /></svg>", "right": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M9 6l6 6l-6 6\" /></svg>", "columns": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12\" /> <path d=\"M12 4l0 16\" /></svg>", "list": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M9 6l11 0\" /> <path d=\"M9 12l11 0\" /> <path d=\"M9 18l11 0\" /> <path d=\"M5 6l0 .01\" /> <path d=\"M5 12l0 .01\" /> <path d=\"M5 18l0 .01\" /></svg>", "play": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M7 4v16l13 -8l-13 -8\" /></svg>", "check": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12l5 5l10 -10\" /></svg>", "cash": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M7 15h-3a1 1 0 0 1 -1 -1v-8a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v3\" /> <path d=\"M7 10a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v8a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1l0 -8\" /> <path d=\"M12 14a2 2 0 1 0 4 0a2 2 0 0 0 -4 0\" /></svg>", "x": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M18 6l-12 12\" /> <path d=\"M6 6l12 12\" /></svg>", "userx": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0\" /> <path d=\"M6 21v-2a4 4 0 0 1 4 -4h3.5\" /> <path d=\"M22 22l-5 -5\" /> <path d=\"M17 22l5 -5\" /></svg>", "globe": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0\" /> <path d=\"M3.6 9h16.8\" /> <path d=\"M3.6 15h16.8\" /> <path d=\"M11.5 3a17 17 0 0 0 0 18\" /> <path d=\"M12.5 3a17 17 0 0 1 0 18\" /></svg>", "alert": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0\" /> <path d=\"M12 8v4\" /> <path d=\"M12 16h.01\" /></svg>", "ok": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\" /> <path d=\"M9 12l2 2l4 -4\" /></svg>", "user": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0\" /> <path d=\"M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2\" /></svg>", "phone": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2\" /></svg>", "tag": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6.5 7.5a1 1 0 1 0 2 0a1 1 0 1 0 -2 0\" /> <path d=\"M3 6v5.172a2 2 0 0 0 .586 1.414l7.71 7.71a2.41 2.41 0 0 0 3.408 0l5.592 -5.592a2.41 2.41 0 0 0 0 -3.408l-7.71 -7.71a2 2 0 0 0 -1.414 -.586h-5.172a3 3 0 0 0 -3 3\" /></svg>", "note": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M13 20l7 -7\" /> <path d=\"M13 20v-6a1 1 0 0 1 1 -1h6v-7a2 2 0 0 0 -2 -2h-12a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7\" /></svg>", "photo": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M15 8h.01\" /> <path d=\"M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12\" /> <path d=\"M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5\" /> <path d=\"M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3\" /></svg>", "clock": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0\" /> <path d=\"M12 7v5l3 3\" /></svg>", "message": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 20l1.3 -3.9c-2.324 -3.437 -1.426 -7.872 2.1 -10.374c3.526 -2.501 8.59 -2.296 11.845 .48c3.255 2.777 3.695 7.266 1.029 10.501c-2.666 3.235 -7.615 4.215 -11.574 2.293l-4.7 1\" /></svg>", "mail": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10\" /> <path d=\"M3 7l9 6l9 -6\" /></svg>", "undo": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M9 14l-4 -4l4 -4\" /> <path d=\"M5 10h11a4 4 0 1 1 0 8h-1\" /></svg>", "search": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0\" /> <path d=\"M21 21l-6 -6\" /></svg>", "download": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2\" /> <path d=\"M7 11l5 5l5 -5\" /> <path d=\"M12 4l0 12\" /></svg>", "crown": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 6l4 6l5 -4l-2 10h-14l-2 -10l5 4l4 -6\" /></svg>", "desk": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 14v-3a8 8 0 1 1 16 0v3\" /> <path d=\"M18 19c0 1.657 -2.686 3 -6 3\" /> <path d=\"M4 14a2 2 0 0 1 2 -2h1a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-1a2 2 0 0 1 -2 -2v-3\" /> <path d=\"M15 14a2 2 0 0 1 2 -2h1a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-1a2 2 0 0 1 -2 -2v-3\" /></svg>", "brush": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 21v-4a4 4 0 1 1 4 4h-4\" /> <path d=\"M21 3a16 16 0 0 0 -12.8 10.2\" /> <path d=\"M21 3a16 16 0 0 1 -10.2 12.8\" /> <path d=\"M10.6 9a9 9 0 0 1 4.4 4.4\" /></svg>", "sparkles": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2m0 -12a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2m-7 12a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6\" /></svg>", "volume": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M15 8a5 5 0 0 1 0 8\" /> <path d=\"M17.7 5a9 9 0 0 1 0 14\" /> <path d=\"M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5\" /></svg>", "volumeoff": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M15 8a5 5 0 0 1 1.912 4.934m-1.377 2.602a5 5 0 0 1 -.535 .464\" /> <path d=\"M17.7 5a9 9 0 0 1 2.362 11.086m-1.676 2.299a9 9 0 0 1 -.686 .615\" /> <path d=\"M9.069 5.054l.431 -.554a.8 .8 0 0 1 1.5 .5v2m0 4v8a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l1.294 -1.664\" /> <path d=\"M3 3l18 18\" /></svg>", "menu": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 6l16 0\" /> <path d=\"M4 12l16 0\" /> <path d=\"M4 18l16 0\" /></svg>", "home": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12l-2 0l9 -9l9 9l-2 0\" /> <path d=\"M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7\" /> <path d=\"M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6\" /></svg>", "usercircle": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0\" /> <path d=\"M9 10a3 3 0 1 0 6 0a3 3 0 1 0 -6 0\" /> <path d=\"M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855\" /></svg>", "upload": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M15 8h.01\" /> <path d=\"M12.5 21h-6.5a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v6.5\" /> <path d=\"M3 16l5 -5c.928 -.893 2.072 -.893 3 0l3.5 3.5\" /> <path d=\"M14 14l1 -1c.679 -.653 1.473 -.829 2.214 -.526\" /> <path d=\"M19 22v-6\" /> <path d=\"M22 19l-3 -3l-3 3\" /></svg>", "trash": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 7l16 0\" /> <path d=\"M10 11l0 6\" /> <path d=\"M14 11l0 6\" /> <path d=\"M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12\" /> <path d=\"M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3\" /></svg>", "edit": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4\" /> <path d=\"M13.5 6.5l4 4\" /></svg>", "mic": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M9 5a3 3 0 0 1 3 -3a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3a3 3 0 0 1 -3 -3l0 -5\" /> <path d=\"M5 10a7 7 0 0 0 14 0\" /> <path d=\"M8 21l8 0\" /> <path d=\"M12 17l0 4\" /></svg>", "stop": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 7a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2l0 -10\" /></svg>", "bluetooth": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M7 8l10 8l-5 4l0 -16l5 4l-10 8\" /></svg>", "speaker": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M18 8a3 3 0 0 1 0 6\" /> <path d=\"M10 8v11a1 1 0 0 1 -1 1h-1a1 1 0 0 1 -1 -1v-5\" /> <path d=\"M12 8l4.524 -3.77a.9 .9 0 0 1 1.476 .692v12.156a.9 .9 0 0 1 -1.476 .692l-4.524 -3.77h-8a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h8\" /></svg>", "fileup": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2\" /> <path d=\"M7 9l5 -5l5 5\" /> <path d=\"M12 4l0 12\" /></svg>"};
  const ME = B.me, CAN = ME.can;
  const S = B.settings;
  const WD = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  const CATS = { nail: 'Nail', mi: 'Mi', combo: 'Combo' };
  const LOG_LABEL = { created: 'Tạo lịch', status: 'Trạng thái', assign: 'Đổi thợ', reschedule: 'Đổi giờ', note: 'Ghi chú', cancelled: 'Hủy' };

  /* ---------------- helpers ---------------- */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ic = (n, cls) => `<span class="rbp-i${cls ? ' ' + cls : ''}" aria-hidden="true">${ICON[n] || ''}</span>`;
  const money = (n) => (n || 0).toLocaleString('vi-VN').replace(/,/g, '.') + 'đ';
  const shortMoney = (n) => n >= 1e6 ? (Math.round(n / 1e5) / 10).toString().replace('.', ',') + 'tr' : n >= 1e3 ? Math.round(n / 1e3) + 'k' : String(n || 0);
  const toMin = (hm) => { const p = hm.split(':'); return +p[0] * 60 + +p[1]; };
  const fromMin = (m) => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  const pd = (ymd) => { const p = ymd.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); };
  const ymd = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const addDays = (s, n) => { const d = pd(s); d.setDate(d.getDate() + n); return ymd(d); };
  const dmy = (s) => { const p = s.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; };
  const longDate = (s) => WD[pd(s).getDay()] + ', ' + dmy(s);
  const today = () => ymd(new Date());
  const dur = (m) => { const h = Math.floor(m / 60), r = m % 60; return h ? h + 'g' + (r ? String(r).padStart(2, '0') : '') : r + 'p'; };
  const svcById = (id) => B.services.find((s) => s.id === id);
  const staffById = (id) => B.staff.find((s) => s.id === id);
  const statusLabel = (s) => B.statuses[s] || s;
  const isNarrow = () => window.innerWidth < 760;

  async function api(path, opts = {}) {
    const init = { method: opts.method || 'GET', headers: { 'X-WP-Nonce': B.nonce }, credentials: 'same-origin' };
    if (opts.body) { init.headers['Content-Type'] = 'application/json'; init.body = JSON.stringify(opts.body); }
    try {
      const r = await fetch(B.api + path, init);
      const j = await r.json().catch(() => ({ ok: false, message: 'Máy chủ phản hồi không hợp lệ.' }));
      if (r.status === 401 || r.status === 403 && j.code === 'rest_cookie_invalid_nonce') { j.message = 'Phiên đăng nhập đã hết hạn. Tải lại trang để đăng nhập.'; }
      if (!r.ok && j.ok === undefined) j.ok = false;
      if (j.ok === undefined) j.ok = r.ok;
      return j;
    } catch (e) {
      return { ok: false, message: 'Mất kết nối. Kiểm tra mạng và thử lại.' };
    }
  }

  let toastTimer;
  function toast(msg, kind) {
    let t = document.querySelector('.rbp-toast');
    if (!t) { t = document.createElement('div'); t.className = 'rbp-toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.className = 'rbp-toast show ' + (kind || '');
    t.innerHTML = ic(kind === 'err' ? 'alert' : 'ok') + '<span>' + esc(msg) + '</span>';
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 3600);
  }

  /* ---------------- state + router ---------------- */
  const st = {
    view: 'lich', date: today(), day: null, loading: false,
    mode: CAN.manage ? 'grid' : 'list',
    showCancelled: false,
    drawer: null,            // { id, data, panel }
    pending: null, customers: null, custQ: '', customer: null,
    report: null, range: { preset: '30', from: addDays(today(), -29), to: today() },
    users: null, userForm: false,
    form: null,              // new booking form
    pendingCount: 0,
  };
  try { st.mode = localStorage.getItem('rbp_mode') || st.mode; } catch (e) {}

  const NAV = [
    { id: 'lich', label: CAN.manage ? 'Lịch hẹn' : 'Lịch của tôi', icon: 'cal', show: true },
    { id: 'cho-duyet', label: 'Chờ xác nhận', icon: 'inbox', show: CAN.manage, badge: true },
    { id: 'tao-lich', label: 'Tạo lịch', icon: 'plus', show: CAN.manage },
    { id: 'khach-hang', label: 'Khách hàng', icon: 'users', show: CAN.manage },
    { id: 'bao-cao', label: 'Báo cáo', icon: 'chart', show: CAN.reports },
    { id: 'dich-vu', label: 'Dịch vụ & giá', icon: 'sparkles', show: CAN.owner, group: 'Thiết lập' },
    { id: 'tho', label: 'Kỹ thuật viên', icon: 'brush', show: CAN.owner, group: 'Thiết lập' },
    { id: 'cai-dat', label: 'Cài đặt', icon: 'settings', show: CAN.owner, group: 'Thiết lập' },
    { id: 'chatbot', label: 'Chatbot tư vấn', icon: 'message', show: CAN.owner, group: 'Thiết lập' },
    { id: 'tai-khoan', label: 'Tài khoản nhân viên', icon: 'shield', show: CAN.owner, group: 'Thiết lập' },
  ].filter((n) => n.show);
  const TABS = NAV.length > 5 ? NAV.slice(0, 4) : NAV;   // bottom bar on phones
  const MORE = NAV.length > 5 ? NAV.slice(4) : [];

  function parseHash() {
    const h = location.hash.replace(/^#\/?/, '').split('/');
    const v = NAV.some((n) => n.id === h[0]) ? h[0] : 'lich';
    st.view = v;
    if (v === 'lich' && /^\d{4}-\d{2}-\d{2}$/.test(h[1] || '')) st.date = h[1];
    if (v === 'khach-hang' && h[1]) st.customer = { phone: decodeURIComponent(h[1]) }; else if (v === 'khach-hang') st.customer = null;
  }
  function go(hash) { if (location.hash === hash) route(); else location.hash = hash; }
  window.addEventListener('hashchange', route);

  async function route() {
    parseHash();
    renderShell();
    if (st.view === 'lich') await loadDay();
    if (st.view === 'cho-duyet') await loadPending();
    if (st.view === 'tao-lich') { if (!st.form) newForm(); renderView(); }
    if (st.view === 'khach-hang') await (st.customer ? loadCustomer(st.customer.phone) : loadCustomers());
    if (st.view === 'bao-cao') await loadReport();
    if (st.view === 'tai-khoan') await loadUsers();
    if (['dich-vu', 'tho', 'cai-dat'].indexOf(st.view) > -1) await loadCatalog();
    if (st.view === 'chatbot') await loadChat();
  }

  /* ---------------- shell ---------------- */
  function renderShell() {
    const initials = ME.name.split(' ').map((w) => w[0]).slice(-2).join('').toUpperCase();
    app.innerHTML = `
      <aside class="rbp-side">
        <a class="rbp-brand" href="${esc(B.home)}" title="Về trang chủ website"><span class="rbp-logo">R</span><div><b>RUBY</b><small>Quản lý lịch hẹn</small></div></a>
        <nav class="rbp-nav">${NAV.map((n, i) => `${n.group && (i === 0 || NAV[i - 1].group !== n.group) ? `<small class="rbp-navgroup">${n.group}</small>` : ''}<a href="#/${n.id}" class="${st.view === n.id ? 'on' : ''}">${ic(n.icon)}<span>${n.label}</span>${n.badge ? `<em class="rbp-badge" data-badge ${st.pendingCount ? '' : 'hidden'}>${st.pendingCount}</em>` : ''}</a>`).join('')}</nav>
        <div class="rbp-side-foot">
          ${soundButton('rbp-sublink')}
          <a class="rbp-sublink" href="${esc(B.home)}">${ic('home')}Về trang chủ website</a>
          <a class="rbp-sublink" href="${esc(B.booking)}" target="_blank" rel="noopener">${ic('external')}Trang đặt lịch của khách</a>
          <a class="rbp-sublink" href="${esc(B.account)}">${ic('usercircle')}Thông tin cá nhân</a>
          ${B.wpAdmin ? `<a class="rbp-sublink" href="${esc(B.wpAdmin)}">${ic('settings')}Trang quản trị WordPress</a>` : ''}
          <div class="rbp-me"><span class="rbp-avatar">${esc(initials)}</span><div><b>${esc(ME.name)}</b><small>${esc(ME.roleLabel)}</small></div><a href="${esc(B.logout)}" title="Đăng xuất" aria-label="Đăng xuất">${ic('logout')}</a></div>
        </div>
      </aside>
      <header class="rbp-mtop"><a class="rbp-brand" href="${esc(B.home)}" title="Về trang chủ website"><span class="rbp-logo">R</span><div><b>RUBY</b><small>${esc(ME.roleLabel)} · ${esc(ME.name)}</small></div></a><div class="rbp-mtop-act">${soundButton('rbp-iconbtn', true)}<button class="rbp-iconbtn" data-more aria-label="Menu">${ic('menu')}</button></div></header>
      <main class="rbp-main" id="rbp-view"><div class="rbp-loading">${ic('loader', 'spin')} Đang tải…</div></main>
      <nav class="rbp-tabbar" ${NAV.length < 2 ? 'hidden' : ''}>${TABS.map((n) => `<a href="#/${n.id}" class="${st.view === n.id ? 'on' : ''}${n.id === 'tao-lich' ? ' rbp-tab-plus' : ''}">${ic(n.icon)}<span>${n.id === 'tao-lich' ? 'Tạo' : n.label.replace('Chờ xác nhận', 'Chờ duyệt').replace('Lịch của tôi', 'Lịch').replace('Khách hàng', 'Khách').replace('Lịch hẹn', 'Lịch')}</span>${n.badge ? `<em class="rbp-badge" data-badge ${st.pendingCount ? '' : 'hidden'}>${st.pendingCount}</em>` : ''}</a>`).join('')}${MORE.length ? `<button class="${MORE.some((n) => n.id === st.view) ? 'on' : ''}" data-more>${ic('menu')}<span>Thêm</span></button>` : ''}</nav>
      <div class="rbp-sheet-wrap" id="rbp-more" hidden><div class="rbp-scrim" data-more-close></div><div class="rbp-sheet">
        <div class="rbp-me"><span class="rbp-avatar">${esc(initials)}</span><div><b>${esc(ME.name)}</b><small>${esc(ME.roleLabel)}</small></div></div>
        ${MORE.map((n) => `<a href="#/${n.id}" data-more-close class="${st.view === n.id ? 'on' : ''}">${ic(n.icon)}${n.label}</a>`).join('')}
        <a href="${esc(B.home)}">${ic('home')}Về trang chủ website</a>
        <a href="${esc(B.account)}">${ic('usercircle')}Thông tin cá nhân</a>
        <a href="${esc(B.logout)}" class="rbp-out">${ic('logout')}Đăng xuất</a>
      </div></div>
      <div class="rbp-drawer-wrap" id="rbp-drawer" hidden></div>`;
  }
  const view = () => document.getElementById('rbp-view');
  function renderView() {
    const v = view(); if (!v) return;
    const map = { lich: viewDay, 'cho-duyet': viewPending, 'tao-lich': viewForm, 'khach-hang': () => st.customer ? viewCustomer() : viewCustomers(), 'bao-cao': viewReport, 'tai-khoan': viewUsers, 'dich-vu': viewServices, tho: viewStaff, 'cai-dat': viewSettings, chatbot: viewChat };
    v.innerHTML = map[st.view]();
    if (st.view === 'lich') scrollToNow();
  }
  function setBadge(n) {
    st.pendingCount = n;
    document.querySelectorAll('[data-badge]').forEach((b) => { b.textContent = n; b.hidden = !n; });
  }
  const head = (title, sub, actions) => `<div class="rbp-head"><div><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ''}</div>${actions ? `<div class="rbp-head-act">${actions}</div>` : ''}</div>`;
  const badge = (s) => `<span class="rbp-st rbp-st-${esc(s)}">${esc(statusLabel(s))}</span>`;
  const empty = (icon, title, text) => `<div class="rbp-empty">${ic(icon)}<b>${title}</b><p>${text || ''}</p></div>`;

  /* =========================================================
   * LỊCH THEO NGÀY (FR06)
   * ======================================================= */
  async function loadDay(silent) {
    if (!silent) { st.loading = true; renderView(); }
    const r = await api('/day?date=' + st.date);
    st.loading = false;
    if (!r.ok) { view().innerHTML = empty('alert', 'Không tải được lịch', esc(r.message)); return; }
    const before = st.day && st.day.date === r.date ? st.day.bookings.map((b) => b.id) : null;
    st.day = r;
    setBadge(r.pending_all || 0);
    if (silent && before) {
      const fresh = r.bookings.filter((b) => before.indexOf(b.id) < 0);
      if (fresh.length) fresh.forEach((b) => { const el = document.querySelector('[data-open="' + b.id + '"]'); if (el) el.classList.add('rbp-new'); });
    }
    if (st.view === 'lich') renderView();
  }

  function viewDay() {
    const d = st.date, isToday = d === today();
    const nav = `<div class="rbp-datenav">
        <button class="rbp-iconbtn" data-day="${addDays(d, -1)}" aria-label="Ngày trước">${ic('left')}</button>
        <label class="rbp-datepick">${ic('cal')}<b>${isToday ? 'Hôm nay · ' : ''}${longDate(d)}</b><input type="date" value="${d}" data-pickday aria-label="Chọn ngày"></label>
        <button class="rbp-iconbtn" data-day="${addDays(d, 1)}" aria-label="Ngày sau">${ic('right')}</button>
        ${isToday ? '' : `<button class="rbp-btn rbp-ghost rbp-sm" data-day="${today()}">Hôm nay</button>`}
      </div>`;
    const actions = `${CAN.manage ? `<div class="rbp-seg" role="tablist"><button class="${st.mode === 'grid' ? 'on' : ''}" data-mode="grid">${ic('columns')}Theo thợ</button><button class="${st.mode === 'list' ? 'on' : ''}" data-mode="list">${ic('list')}Danh sách</button></div>` : ''}
      ${CAN.manage ? `<a class="rbp-btn rbp-primary" href="#/tao-lich">${ic('plus')}Tạo lịch</a>` : ''}`;
    let h = head(CAN.manage ? 'Lịch hẹn' : 'Lịch của tôi', CAN.manage ? 'Theo dõi, xác nhận và điều phối thợ cho từng lịch hẹn.' : 'Các lịch hẹn được giao cho bạn.', actions) + nav;
    if (st.loading || !st.day) return h + `<div class="rbp-loading">${ic('loader', 'spin')} Đang tải lịch…</div>`;
    const s = st.day.stats;
    h += `<div class="rbp-kpis">
      ${kpi('cal', 'Lịch hẹn', s.total, 'trong ngày')}
      ${CAN.manage ? kpi('inbox', 'Chờ xác nhận', s.pending, s.pending ? 'cần xử lý' : 'đã xử lý hết', s.pending ? 'warn' : '') : ''}
      ${kpi('play', 'Đang làm', s.in_progress, '')}
      ${kpi('check', 'Hoàn thành', s.done, s.no_show ? s.no_show + ' khách vắng' : '')}
      ${CAN.manage ? kpi('cash', 'Doanh thu', shortMoney(s.revenue), 'dự kiến ' + shortMoney(s.expected)) : ''}
    </div>`;
    const list = st.day.bookings.filter((b) => st.showCancelled || ['cancelled', 'no_show'].indexOf(b.status) < 0);
    const hidden = st.day.bookings.length - list.length;
    if (!st.day.bookings.length) return h + empty('cal', 'Chưa có lịch hẹn nào', isToday ? 'Lịch hẹn mới từ website sẽ tự hiện ở đây (tự cập nhật mỗi phút).' : 'Ngày này chưa có khách đặt.');
    const mode = isNarrow() || !CAN.manage ? 'list' : st.mode;
    h += mode === 'grid' ? dayGrid(list) : dayList(list);
    if (hidden || st.showCancelled) h += `<button class="rbp-link rbp-center" data-toggle-cancelled>${st.showCancelled ? 'Ẩn lịch đã hủy / vắng mặt' : 'Hiện ' + hidden + ' lịch đã hủy / vắng mặt'}</button>`;
    return h;
  }
  const kpi = (icon, label, value, sub, kind) => `<div class="rbp-kpi ${kind || ''}">${ic(icon)}<div><small>${label}</small><b>${value}</b>${sub ? `<em>${sub}</em>` : ''}</div></div>`;

  const PX = 1.15; // px per minute
  function dayGrid(list) {
    const open = Math.floor(toMin(S.open) / 60) * 60, close = Math.ceil(toMin(S.close) / 60) * 60;
    const height = (close - open) * PX;
    const cols = B.staff.filter((s) => s.active || list.some((b) => b.staff_id === s.id)).map((s) => ({ id: s.id, name: s.name, title: s.title, photo: s.photo }));
    if (list.some((b) => !b.staff_id)) cols.unshift({ id: 0, name: 'Chưa gán thợ', title: 'Cần phân công' });
    let hours = '';
    for (let m = open; m <= close; m += 60) hours += `<span style="top:${(m - open) * PX}px">${fromMin(m)}</span>`;
    let lines = '';
    for (let m = open; m < close; m += 30) lines += `<i style="top:${(m - open) * PX}px" class="${m % 60 ? 'half' : ''}"></i>`;
    const colHtml = cols.map((c) => {
      const items = layoutLanes(list.filter((b) => b.staff_id === c.id));
      const load = items.reduce((a, b) => a + b.minutes, 0);
      return `<div class="rbp-col">
        <div class="rbp-colhead">${c.photo ? `<img src="${esc(c.photo)}" alt="">` : `<span class="rbp-avatar ${c.id ? '' : 'warn'}">${c.id ? esc(c.name.split(' ').pop()[0]) : '!'}</span>`}<div><b>${esc(c.name)}</b><small>${items.length} lịch · ${dur(load)}</small></div></div>
        <div class="rbp-colbody" style="height:${height}px">${lines}${items.map((b) => block(b, open)).join('')}</div>
      </div>`;
    }).join('');
    const now = new Date(), nowMin = now.getHours() * 60 + now.getMinutes();
    const nowLine = st.date === today() && nowMin >= open && nowMin <= close ? `<div class="rbp-now" style="top:${(nowMin - open) * PX + 58}px"><span>${fromMin(nowMin)}</span></div>` : '';
    return `<div class="rbp-grid-wrap"><div class="rbp-grid" style="--cols:${cols.length}">
      <div class="rbp-hours" style="height:${height}px">${hours}</div>${colHtml}${nowLine}</div></div>
      <div class="rbp-legend">${['pending', 'confirmed', 'in_progress', 'done'].map((s) => `<span><i class="rbp-dot rbp-st-${s}"></i>${statusLabel(s)}</span>`).join('')}</div>`;
  }
  function layoutLanes(items) {
    const lanes = [];
    items.sort((a, b) => toMin(a.start) - toMin(b.start)).forEach((b) => {
      let lane = lanes.findIndex((end) => end <= toMin(b.start));
      if (lane < 0) { lane = lanes.length; lanes.push(0); }
      lanes[lane] = toMin(b.end); b._lane = lane;
    });
    items.forEach((b) => { b._lanes = lanes.length; });
    return items;
  }
  function block(b, open) {
    const top = (toMin(b.start) - open) * PX, h = Math.max(b.minutes * PX, 30);
    const w = 100 / (b._lanes || 1);
    return `<button class="rbp-block rbp-st-${b.status}${h < 52 ? ' tiny' : ''}" style="top:${top}px;height:${h - 3}px;left:calc(${w * (b._lane || 0)}% + 3px);width:calc(${w}% - 6px)" data-open="${b.id}">
      <span class="rbp-block-time">${b.start}–${b.end}${b.source !== 'web' ? ' · ' + esc(b.source_label) : ''}</span>
      <b>${esc(b.name)}</b>
      <small>${esc(b.services.map((s) => s.name).join(' + '))}</small>
      ${b.images.length ? `<span class="rbp-block-flag" title="Có ảnh mẫu">${ICON.photo}</span>` : ''}
    </button>`;
  }
  function dayList(list) {
    if (!list.length) return empty('cal', 'Không có lịch đang hoạt động', 'Các lịch đã hủy hoặc vắng mặt đang được ẩn.');
    return `<div class="rbp-list">${list.sort((a, b) => toMin(a.start) - toMin(b.start)).map(card).join('')}</div>`;
  }
  function card(b) {
    const quick = quickActions(b);
    return `<article class="rbp-card rbp-bl-${b.status}" data-open="${b.id}" tabindex="0">
      <div class="rbp-card-time"><b>${b.start}</b><small>${b.end}</small></div>
      <div class="rbp-card-main">
        <div class="rbp-card-top"><b>${esc(b.name)}</b>${badge(b.status)}</div>
        <p>${esc(b.services.map((s) => s.name).join(' + '))}</p>
        <div class="rbp-card-meta">
          <span>${ic('user')}${b.staff_id ? esc(b.staff_name) : '<em class="warn">Chưa gán thợ</em>'}</span>
          ${CAN.manage ? `<span>${ic('phone')}${esc(b.phone)}</span>` : ''}
          <span>${ic('cash')}${money(b.total)}</span>
          ${b.source !== 'web' ? `<span>${ic('tag')}${esc(b.source_label)}</span>` : ''}
          ${b.note ? `<span class="rbp-note-flag">${ic('note')}Có ghi chú</span>` : ''}
          ${b.images.length ? `<span>${ic('photo')}${b.images.length} ảnh mẫu</span>` : ''}
        </div>
      </div>
      ${quick ? `<div class="rbp-card-act">${quick}</div>` : ''}
    </article>`;
  }
  function quickActions(b) {
    const mine = !CAN.manage;
    if (b.status === 'pending' && CAN.manage) return `<button class="rbp-btn rbp-primary rbp-sm" data-act="confirmed" data-id="${b.id}" ${b.staff_id ? '' : 'disabled title="Cần gán thợ trước"'}>${ic('check')}Xác nhận</button>`;
    if (b.status === 'confirmed') return `<button class="rbp-btn rbp-blue rbp-sm" data-act="in_progress" data-id="${b.id}">${ic('play')}Bắt đầu</button>`;
    if (b.status === 'in_progress') return `<button class="rbp-btn rbp-green rbp-sm" data-act="done" data-id="${b.id}">${ic('check')}Hoàn thành</button>`;
    return mine ? '' : '';
  }
  function scrollToNow() {
    const g = document.querySelector('.rbp-grid-wrap');
    if (!g || st.date !== today()) return;
    const n = new Date(), m = n.getHours() * 60 + n.getMinutes() - Math.floor(toMin(S.open) / 60) * 60 - 60;
    g.scrollTop = Math.max(0, m * PX);
  }

  /* =========================================================
   * CHỜ XÁC NHẬN
   * ======================================================= */
  async function loadPending() {
    renderView();
    const r = await api('/pending');
    st.pending = r.ok ? r.bookings : [];
    setBadge(st.pending.length);
    renderView();
  }
  function viewPending() {
    let h = head('Chờ xác nhận', 'Lịch khách đặt qua website. Kiểm tra thợ rồi xác nhận – khách sẽ nhận email thông báo.');
    if (!st.pending) return h + `<div class="rbp-loading">${ic('loader', 'spin')} Đang tải…</div>`;
    if (!st.pending.length) return h + empty('check', 'Đã xử lý hết', 'Không còn lịch nào chờ xác nhận.');
    const byDay = {};
    st.pending.forEach((b) => { (byDay[b.date] = byDay[b.date] || []).push(b); });
    return h + Object.keys(byDay).map((d) => `<h3 class="rbp-group">${d === today() ? 'Hôm nay · ' : d === addDays(today(), 1) ? 'Ngày mai · ' : ''}${longDate(d)}<small>${byDay[d].length} lịch</small></h3>
      <div class="rbp-list">${byDay[d].map((b) => `<article class="rbp-card rbp-bl-pending" data-open="${b.id}" tabindex="0">
        <div class="rbp-card-time"><b>${b.start}</b><small>${b.end}</small></div>
        <div class="rbp-card-main">
          <div class="rbp-card-top"><b>${esc(b.name)}</b><span class="rbp-muted">${esc(b.phone)}</span></div>
          <p>${esc(b.services.map((s) => s.name).join(' + '))} · ${money(b.total)}</p>
          ${b.note ? `<p class="rbp-quote">“${esc(b.note)}”</p>` : ''}
        </div>
        <div class="rbp-card-act rbp-assign" data-stop>
          <label class="rbp-select">${ic('user')}<select data-assign="${b.id}" aria-label="Kỹ thuật viên">${staffOptions(b)}</select></label>
          <button class="rbp-btn rbp-primary rbp-sm" data-act="confirmed" data-id="${b.id}" ${b.staff_id ? '' : 'disabled'}>${ic('check')}Xác nhận</button>
        </div>
      </article>`).join('')}</div>`).join('');
  }
  function staffOptions(b) {
    const ok = B.staff.filter((s) => s.active && (!s.service_ids.length || b.service_ids.every((id) => s.service_ids.indexOf(id) > -1)));
    return (b.staff_id ? '' : '<option value="">— Chọn thợ —</option>') + ok.map((s) => `<option value="${s.id}" ${s.id === b.staff_id ? 'selected' : ''}>${esc(s.name)}${b.staff_auto && s.id === b.staff_id ? ' (hệ thống gợi ý)' : ''}</option>`).join('');
  }

  /* =========================================================
   * CHI TIẾT LỊCH HẸN (ngăn kéo bên phải)
   * ======================================================= */
  async function openDrawer(id) {
    st.drawer = { id, data: null, panel: '' };
    drawEl().hidden = false;
    document.body.classList.add('rbp-noscroll');
    renderDrawer();
    const r = await api('/booking/' + id);
    if (!r.ok) { toast(r.message, 'err'); closeDrawer(); return; }
    st.drawer.data = r;
    renderDrawer();
  }
  const drawEl = () => document.getElementById('rbp-drawer');
  function closeDrawer() { st.drawer = null; st.edit = null; const d = drawEl(); if (d) { d.hidden = true; d.innerHTML = ''; } document.body.classList.remove('rbp-noscroll'); }

  function renderDrawer() {
    const d = drawEl(); if (!d || !st.drawer) return;
    const r = st.drawer.data;
    if (!r) { d.innerHTML = `<div class="rbp-scrim" data-close></div><section class="rbp-drawer"><div class="rbp-loading">${ic('loader', 'spin')} Đang tải…</div></section>`; return; }
    const b = r.booking, c = r.customer, p = st.drawer.panel;
    const actions = drawerActions(b);
    d.innerHTML = `<div class="rbp-scrim" data-close></div>
    <section class="rbp-drawer" role="dialog" aria-label="Chi tiết lịch hẹn ${esc(b.code)}">
      <header class="rbp-dhead"><div><small>Mã lịch hẹn</small><b>${esc(b.code)}</b></div>${badge(b.status)}<button class="rbp-iconbtn" data-close aria-label="Đóng">${ic('x')}</button></header>
      <div class="rbp-dbody">
        <div class="rbp-dsec rbp-cust">
          <div class="rbp-avatar lg">${esc(b.name.split(' ').pop()[0] || '?')}</div>
          <div class="rbp-cust-main"><b>${esc(b.name)}</b>
            <div class="rbp-cust-links">${CAN.manage ? `<a href="tel:${esc(b.phone)}">${ic('phone')}${esc(b.phone)}</a><a href="https://zalo.me/${esc(b.phone)}" target="_blank" rel="noopener">${ic('message')}Zalo</a>` : `<span>${ic('phone')}${esc(b.phone)}</span>`}${b.email ? `<a href="mailto:${esc(b.email)}">${ic('mail')}Email</a>` : ''}</div>
            ${c ? `<a class="rbp-cust-stat" href="#/khach-hang/${encodeURIComponent(b.phone)}" data-close>${c.visits > 1 ? `Khách quen · ${c.visits} lần đặt · ${c.done} hoàn thành${c.no_show ? ` · <em class="warn">${c.no_show} lần vắng</em>` : ''}` : 'Khách mới · lần đặt đầu tiên'} ${ic('right')}</a>` : ''}
          </div>
        </div>
        <div class="rbp-dsec">
          <h4>Lịch hẹn</h4>
          <div class="rbp-kv">${ic('cal')}<span>${longDate(b.date)}</span></div>
          <div class="rbp-kv">${ic('clock')}<span><b>${b.start} – ${b.end}</b> · ${dur(b.minutes)}</span></div>
          <div class="rbp-kv">${ic('user')}<span>${b.staff_id ? esc(b.staff_name) + (b.staff_auto ? ' <em class="rbp-muted">(hệ thống gợi ý)</em>' : '') : '<em class="warn">Chưa gán thợ</em>'}</span>${CAN.manage && ['pending', 'confirmed', 'in_progress'].indexOf(b.status) > -1 ? `<button class="rbp-link" data-panel="assign">Đổi thợ</button>` : ''}</div>
          <div class="rbp-kv">${ic('tag')}<span>${esc(b.source_label)}</span></div>
          ${p === 'assign' ? assignPanel(b) : ''}
        </div>
        <div class="rbp-dsec">
          <h4>Dịch vụ</h4>
          ${b.services.map((s) => `<div class="rbp-line"><span>${esc(s.name)} <small>${dur(s.duration)}</small></span><b>${money(s.price)}</b></div>`).join('')}
          <div class="rbp-line rbp-total"><span>Tổng tạm tính</span><b>${money(b.total)}</b></div>
        </div>
        ${b.note || b.images.length ? `<div class="rbp-dsec"><h4>Khách ghi chú</h4>${b.note ? `<p class="rbp-quote">“${esc(b.note)}”</p>` : ''}${b.images.length ? `<div class="rbp-thumbs">${b.images.map((i) => `<a href="${esc(i.full)}" target="_blank" rel="noopener"><img src="${esc(i.thumb)}" alt="Ảnh mẫu"></a>`).join('')}</div>` : ''}</div>` : ''}
        ${b.cancel_reason && ['cancelled'].indexOf(b.status) > -1 ? `<div class="rbp-dsec"><h4>Lý do hủy</h4><p class="rbp-quote">${esc(b.cancel_reason)}</p></div>` : ''}
        <div class="rbp-dsec">
          <h4>Ghi chú nội bộ <small>chỉ nhân viên thấy</small></h4>
          <textarea class="rbp-textarea" rows="2" data-note placeholder="VD: khách thích màu nude, móng yếu…">${esc(b.admin_note)}</textarea>
          <button class="rbp-btn rbp-ghost rbp-sm" data-save-note>${ic('check')}Lưu ghi chú</button>
        </div>
        ${p === 'reschedule' ? reschedulePanel(b) : ''}
        ${p === 'cancel' ? cancelPanel() : ''}
        <div class="rbp-dsec">
          <h4>Lịch sử thao tác</h4>
          <ol class="rbp-log">${r.logs.length ? r.logs.map((l) => `<li><b>${esc(LOG_LABEL[l.action] || l.action)}</b> ${esc(l.detail)}<small>${esc(l.by)} · ${esc(l.at.slice(11, 16))} ${esc(dmy(l.at.slice(0, 10)))}</small></li>`).join('') : '<li class="rbp-muted">Chưa có thao tác.</li>'}</ol>
        </div>
      </div>
      ${actions ? `<footer class="rbp-dfoot">${actions}</footer>` : ''}
    </section>`;
    if (p === 'reschedule' && !st.drawer.slots) loadDrawerSlots(b.date);
  }

  function drawerActions(b) {
    const A = (act, label, icon, cls, extra) => `<button class="rbp-btn ${cls}" data-act="${act}" data-id="${b.id}" ${extra || ''}>${ic(icon)}${label}</button>`;
    const P = (panel, label, icon) => `<button class="rbp-btn rbp-ghost" data-panel="${panel}">${ic(icon)}${label}</button>`;
    if (!CAN.manage) {
      if (b.status === 'confirmed') return A('in_progress', 'Bắt đầu làm', 'play', 'rbp-blue rbp-wide');
      if (b.status === 'in_progress') return A('done', 'Hoàn thành', 'check', 'rbp-green rbp-wide');
      return '';
    }
    switch (b.status) {
      case 'pending': return P('cancel', 'Hủy', 'x') + P('reschedule', 'Đổi giờ', 'clock') + A('confirmed', 'Xác nhận', 'check', 'rbp-primary rbp-grow', b.staff_id ? '' : 'disabled title="Gán thợ trước khi xác nhận"');
      case 'confirmed': return `<div class="rbp-more">${P('cancel', 'Hủy', 'x')}${A('no_show', 'Khách vắng', 'userx', 'rbp-ghost')}${P('reschedule', 'Đổi giờ', 'clock')}</div>` + A('in_progress', 'Bắt đầu làm', 'play', 'rbp-blue rbp-grow');
      case 'in_progress': return A('confirmed', 'Hoàn tác', 'undo', 'rbp-ghost') + A('done', 'Hoàn thành', 'check', 'rbp-green rbp-grow');
      case 'done': return A('in_progress', 'Mở lại', 'undo', 'rbp-ghost');
      default: return P('reschedule', 'Đặt lại giờ khác', 'clock') + A('confirmed', 'Khôi phục lịch', 'undo', 'rbp-primary rbp-grow');
    }
  }

  function assignPanel(b) {
    return `<div class="rbp-panel"><p class="rbp-muted">Chỉ thợ làm được các dịch vụ này. Hệ thống sẽ từ chối nếu thợ bị trùng giờ.</p>
      <div class="rbp-chips">${B.staff.filter((s) => s.active && (!s.service_ids.length || b.service_ids.every((id) => s.service_ids.indexOf(id) > -1))).map((s) => `<button class="rbp-chip ${s.id === b.staff_id ? 'on' : ''}" data-assign-to="${s.id}">${esc(s.name)}</button>`).join('')}</div></div>`;
  }
  function cancelPanel() {
    return `<div class="rbp-dsec rbp-panel rbp-danger-panel"><h4>Hủy lịch hẹn</h4>
      <div class="rbp-chips">${['Khách báo bận', 'Khách đặt nhầm', 'Thợ nghỉ đột xuất', 'Tiệm quá tải'].map((r) => `<button class="rbp-chip" data-reason="${r}">${r}</button>`).join('')}</div>
      <textarea class="rbp-textarea" rows="2" data-cancel-reason placeholder="Lý do hủy (bắt buộc) – khách sẽ nhận email báo hủy"></textarea>
      <div class="rbp-row"><button class="rbp-btn rbp-ghost" data-panel="">Thôi</button><button class="rbp-btn rbp-danger" data-confirm-cancel>${ic('x')}Xác nhận hủy</button></div></div>`;
  }
  function reschedulePanel(b) {
    const s = st.drawer.slots, date = st.drawer.rsDate || b.date;
    return `<div class="rbp-dsec rbp-panel"><h4>Đổi giờ hẹn</h4>
      <label class="rbp-field">Ngày<input type="date" value="${date}" min="${today()}" data-rs-date></label>
      ${!s ? `<div class="rbp-loading sm">${ic('loader', 'spin')} Đang tìm giờ trống…</div>` : !s.length ? '<p class="rbp-muted">Ngày này tiệm nghỉ.</p>' :
        `<div class="rbp-slots">${s.map((x) => `<button class="rbp-slot ${st.drawer.rsTime === x.time ? 'on' : ''}" data-rs-time="${x.time}" ${x.free.length && !x.past ? '' : 'disabled'}><b>${x.time}</b><small>${x.free.length ? x.free.length + ' thợ trống' : 'Kín'}</small></button>`).join('')}</div>`}
      ${st.drawer.rsTime ? `<label class="rbp-field">Kỹ thuật viên<select data-rs-staff><option value="0">Tự chọn thợ trống</option>${(s.find((x) => x.time === st.drawer.rsTime) || { free: [] }).free.map((f) => `<option value="${f.id}" ${f.id === b.staff_id ? 'selected' : ''}>${esc(f.name)}</option>`).join('')}</select></label>` : ''}
      <div class="rbp-row"><button class="rbp-btn rbp-ghost" data-panel="">Thôi</button><button class="rbp-btn rbp-primary" data-do-reschedule ${st.drawer.rsTime ? '' : 'disabled'}>${ic('check')}Lưu giờ mới</button></div></div>`;
  }
  async function loadDrawerSlots(date) {
    const b = st.drawer.data.booking;
    st.drawer.rsDate = date; st.drawer.slots = null; st.drawer.rsTime = null;
    const r = await api(`/availability?date=${date}&exclude=${b.id}`);
    if (!st.drawer) return;
    st.drawer.slots = r.ok ? r.slots : [];
    renderDrawer();
  }

  async function act(id, status, reason) {
    const r = await api('/booking/' + id + '/status', { method: 'POST', body: { status, reason } });
    if (!r.ok) { toast(r.message, 'err'); return false; }
    toast(({ confirmed: 'Đã xác nhận', in_progress: 'Đã bắt đầu', done: 'Đã hoàn thành', cancelled: 'Đã hủy lịch', no_show: 'Đã ghi nhận khách vắng', pending: 'Đã chuyển về chờ xác nhận' })[status] + ' · ' + r.booking.name);
    await afterChange(r.booking);
    return true;
  }
  async function afterChange(b) {
    if (st.drawer && st.drawer.id === b.id) {
      const r = await api('/booking/' + b.id);
      if (r.ok && st.drawer) { st.drawer.data = r; st.drawer.panel = ''; st.drawer.slots = null; renderDrawer(); }
    }
    if (st.view === 'lich') loadDay(true);
    if (st.view === 'cho-duyet') loadPending();
    if (st.view === 'khach-hang' && st.customer) loadCustomer(st.customer.phone);
  }

  /* =========================================================
   * TẠO LỊCH (khách gọi điện / vãng lai)
   * ======================================================= */
  function newForm(prefill) {
    st.form = Object.assign({ phone: '', name: '', email: '', source: 'phone', services: [], date: today(), time: '', staff: 0, note: '', admin_note: '', cat: 'all', q: '', slots: null, known: null, busy: false, err: '' }, prefill || {});
  }
  function viewForm() {
    const f = st.form, t = f.services.map(svcById).filter(Boolean);
    const total = t.reduce((a, s) => a + s.price, 0), minutes = t.reduce((a, s) => a + s.duration, 0);
    const svcs = B.services.filter((s) => s.active && (f.cat === 'all' || s.category === f.cat) && (!f.q || s.name.toLowerCase().indexOf(f.q.toLowerCase()) > -1));
    return head('Tạo lịch hẹn', 'Dùng khi khách gọi điện, nhắn Facebook/Zalo hoặc đến trực tiếp. Lịch tạo ở đây được xác nhận ngay.') + `
    <div class="rbp-form">
      <section class="rbp-fsec"><h3><span>1</span>Khách hàng</h3>
        <div class="rbp-grid2">
          <label class="rbp-field">Số điện thoại *<input type="tel" inputmode="tel" data-f="phone" value="${esc(f.phone)}" placeholder="09xx xxx xxx" autocomplete="off"></label>
          <label class="rbp-field">Họ tên *<input type="text" data-f="name" value="${esc(f.name)}" placeholder="Tên khách"></label>
        </div>
        ${f.known ? `<div class="rbp-known">${ic('ok')}<span><b>Khách quen</b> · ${f.known.bookings.length} lần đặt${f.known.favorite.length ? ' · hay làm: ' + esc(f.known.favorite.join(', ')) : ''}</span><a href="#/khach-hang/${encodeURIComponent(f.phone)}">Xem lịch sử</a></div>` : ''}
        <div class="rbp-grid2">
          <label class="rbp-field">Email <small>(để gửi xác nhận, không bắt buộc)</small><input type="email" data-f="email" value="${esc(f.email)}"></label>
          <div class="rbp-field">Nguồn khách<div class="rbp-chips">${Object.keys(B.sources).filter((k) => k !== 'web').map((k) => `<button class="rbp-chip ${f.source === k ? 'on' : ''}" data-src="${k}">${esc(B.sources[k])}</button>`).join('')}</div></div>
        </div>
      </section>
      <section class="rbp-fsec"><h3><span>2</span>Dịch vụ ${t.length ? `<em>${t.length} dịch vụ · ${dur(minutes)} · ${money(total)}</em>` : ''}</h3>
        <div class="rbp-row wrap"><div class="rbp-chips">${['all', 'nail', 'mi', 'combo'].map((c) => `<button class="rbp-chip ${f.cat === c ? 'on' : ''}" data-fcat="${c}">${c === 'all' ? 'Tất cả' : CATS[c]}</button>`).join('')}</div>
        <label class="rbp-search">${ic('search')}<input type="search" data-f="q" value="${esc(f.q)}" placeholder="Tìm dịch vụ"></label></div>
        <div class="rbp-svcpick">${svcs.map((s) => `<button class="rbp-svcbtn ${f.services.indexOf(s.id) > -1 ? 'on' : ''}" data-fsvc="${s.id}"><span><b>${esc(s.name)}</b><small>${dur(s.duration)}</small></span><em>${money(s.price)}</em><i>${ICON.check}</i></button>`).join('') || '<p class="rbp-muted">Không tìm thấy dịch vụ.</p>'}</div>
      </section>
      <section class="rbp-fsec"><h3><span>3</span>Thời gian & kỹ thuật viên</h3>
        <div class="rbp-row wrap">
          <label class="rbp-field rbp-inline">Ngày<input type="date" data-f="date" value="${f.date}" min="${today()}"></label>
          <div class="rbp-chips">${[0, 1, 2].map((n) => `<button class="rbp-chip ${f.date === addDays(today(), n) ? 'on' : ''}" data-fdate="${addDays(today(), n)}">${['Hôm nay', 'Ngày mai', 'Ngày kia'][n]}</button>`).join('')}</div>
        </div>
        ${!t.length ? '<p class="rbp-muted">Chọn dịch vụ để xem giờ trống.</p>' : !f.slots ? `<div class="rbp-loading sm">${ic('loader', 'spin')} Đang tìm giờ trống…</div>` : !f.slots.length ? '<p class="rbp-muted">Tiệm nghỉ ngày này.</p>' :
          `<div class="rbp-slots">${f.slots.map((x) => `<button class="rbp-slot ${f.time === x.time ? 'on' : ''}" data-ftime="${x.time}" ${x.free.length && !x.past ? '' : 'disabled'}><b>${x.time}</b><small>${x.past ? 'Đã qua' : x.free.length ? x.free.length + ' thợ trống' : 'Kín'}</small></button>`).join('')}</div>`}
        ${f.time ? `<div class="rbp-field">Kỹ thuật viên<div class="rbp-chips"><button class="rbp-chip ${!f.staff ? 'on' : ''}" data-fstaff="0">Tự chọn thợ rảnh nhất</button>${((f.slots || []).find((x) => x.time === f.time) || { free: [] }).free.map((s) => `<button class="rbp-chip ${f.staff === s.id ? 'on' : ''}" data-fstaff="${s.id}">${esc(s.name)} <small>${s.load} lịch</small></button>`).join('')}</div></div>` : ''}
      </section>
      <section class="rbp-fsec"><h3><span>4</span>Ghi chú</h3>
        <div class="rbp-grid2">
          <label class="rbp-field">Yêu cầu của khách<textarea class="rbp-textarea" rows="2" data-f="note" placeholder="VD: muốn mẫu như hình đã gửi qua Zalo">${esc(f.note)}</textarea></label>
          <label class="rbp-field">Ghi chú nội bộ<textarea class="rbp-textarea" rows="2" data-f="admin_note" placeholder="Chỉ nhân viên thấy">${esc(f.admin_note)}</textarea></label>
        </div>
      </section>
      ${f.err ? `<p class="rbp-error" role="alert">${ic('alert')}${esc(f.err)}</p>` : ''}
      <div class="rbp-formbar"><div><small>${t.length ? t.length + ' dịch vụ · ' + dur(minutes) : 'Chưa chọn dịch vụ'}${f.time ? ' · ' + f.time + ' ' + dmy(f.date).slice(0, 5) : ''}</small><b>${money(total)}</b></div>
        <button class="rbp-btn rbp-ghost" data-reset-form>Làm lại</button>
        <button class="rbp-btn rbp-primary" data-submit-form ${f.busy ? 'disabled' : ''}>${ic('check')}${f.busy ? 'Đang lưu…' : 'Tạo lịch hẹn'}</button></div>
    </div>`;
  }
  async function loadFormSlots() {
    const f = st.form;
    if (!f.services.length) { f.slots = null; renderView(); return; }
    f.slots = null; renderView();
    const key = f.date + f.services.join();
    const r = await api(`/availability?date=${f.date}&services=${f.services.join(',')}`);
    if (st.form !== f || key !== f.date + f.services.join()) return;
    f.slots = r.ok ? r.slots : [];
    if (f.time && !f.slots.some((x) => x.time === f.time && x.free.length)) { f.time = ''; f.staff = 0; }
    renderView();
  }
  async function lookupPhone() {
    const f = st.form, p = f.phone.replace(/\D/g, '');
    if (!/^0\d{9}$/.test(p)) { if (f.known) { f.known = null; renderView(); } return; }
    const r = await api('/customer?phone=' + p);
    if (st.form !== f) return;
    f.known = r.ok && r.found ? r : null;
    if (f.known) { if (!f.name) f.name = r.name; if (!f.email) f.email = r.email; }
    renderView();
  }
  async function submitForm() {
    const f = st.form;
    f.err = '';
    if (!/^0[35789]\d{8}$/.test(f.phone.replace(/\D/g, ''))) f.err = 'Số điện thoại chưa đúng (10 số, bắt đầu bằng 0).';
    else if (f.name.trim().length < 2) f.err = 'Nhập tên khách.';
    else if (!f.services.length) f.err = 'Chọn ít nhất 1 dịch vụ.';
    else if (!f.time) f.err = 'Chọn giờ hẹn.';
    if (f.err) { renderView(); return; }
    f.busy = true; renderView();
    const r = await api('/bookings', { method: 'POST', body: { phone: f.phone, name: f.name, email: f.email, source: f.source, services: f.services, date: f.date, time: f.time, staff_id: f.staff, note: f.note, admin_note: f.admin_note } });
    f.busy = false;
    if (!r.ok) { f.err = r.message; renderView(); if (/trùng|trống|Kín/i.test(r.message)) loadFormSlots(); return; }
    toast('Đã tạo lịch ' + r.booking.code + ' · ' + r.booking.start + ' · ' + r.booking.staff_name);
    st.date = r.booking.date; newForm();
    go('#/lich/' + r.booking.date);
    setTimeout(() => openDrawer(r.booking.id), 300);
  }

  /* =========================================================
   * KHÁCH HÀNG (FR15)
   * ======================================================= */
  async function loadCustomers() {
    st.customers = null; renderView();
    const r = await api('/customers?q=' + encodeURIComponent(st.custQ));
    st.customers = r.ok ? r.customers : [];
    renderView();
  }
  function viewCustomers() {
    let h = head('Khách hàng', 'Tổng hợp theo số điện thoại – xem lịch sử, số lần vắng, dịch vụ hay làm.') +
      `<label class="rbp-search big">${ic('search')}<input type="search" data-custq value="${esc(st.custQ)}" placeholder="Tìm theo tên hoặc số điện thoại"></label>`;
    if (!st.customers) return h + `<div class="rbp-loading">${ic('loader', 'spin')} Đang tải…</div>`;
    if (!st.customers.length) return h + empty('users', 'Không tìm thấy khách', st.custQ ? 'Thử tìm bằng số điện thoại.' : 'Khách sẽ xuất hiện sau lượt đặt lịch đầu tiên.');
    return h + `<div class="rbp-table-wrap"><table class="rbp-table"><thead><tr><th>Khách hàng</th><th>Lượt đặt</th><th>Hoàn thành</th><th>Vắng / hủy</th><th>Đã chi</th><th>Lần gần nhất</th></tr></thead><tbody>
      ${st.customers.map((c) => `<tr data-cust="${esc(c.phone)}" tabindex="0"><td><b>${esc(c.name)}</b><small>${esc(c.phone)}</small></td><td>${c.visits}</td><td>${c.done}</td><td>${c.no_show ? `<em class="warn">${c.no_show} vắng</em>` : '0'}${c.cancelled ? ` · ${c.cancelled} hủy` : ''}</td><td>${money(c.spent)}</td><td>${dmy(c.last_at.slice(0, 10))}</td></tr>`).join('')}
    </tbody></table></div>`;
  }
  async function loadCustomer(phone) {
    st.customer = { phone, data: undefined }; renderView();
    const r = await api('/customer?phone=' + encodeURIComponent(phone));
    st.customer = { phone, data: r.ok && r.found ? r : null };
    renderView();
  }
  function viewCustomer() {
    const c = st.customer.data;
    const back = `<a class="rbp-link" href="#/khach-hang">${ic('left')}Tất cả khách hàng</a>`;
    if (c === undefined) return back + `<div class="rbp-loading">${ic('loader', 'spin')} Đang tải…</div>`;
    if (!c) return back + empty('users', 'Không tìm thấy khách', 'Số điện thoại này chưa có lịch hẹn nào.');
    const done = c.bookings.filter((b) => b.status === 'done');
    const spent = done.reduce((a, b) => a + b.total, 0);
    const ns = c.bookings.filter((b) => b.status === 'no_show').length;
    return back + head(esc(c.name), `${esc(c.phone)}${c.email ? ' · ' + esc(c.email) : ''}`, CAN.manage ? `<a class="rbp-btn rbp-ghost" href="tel:${esc(c.phone)}">${ic('phone')}Gọi</a><button class="rbp-btn rbp-primary" data-book-for="${esc(c.phone)}">${ic('plus')}Đặt lịch mới</button>` : '') +
      `<div class="rbp-kpis">${kpi('cal', 'Lượt đặt', c.bookings.length, '')}${kpi('check', 'Hoàn thành', done.length, '')}${kpi('cash', 'Đã chi', shortMoney(spent), '')}${kpi('userx', 'Vắng mặt', ns, ns ? 'cần lưu ý' : '', ns ? 'warn' : '')}</div>
      ${c.favorite.length ? `<p class="rbp-muted">Dịch vụ hay làm: <b>${esc(c.favorite.join(', '))}</b></p>` : ''}
      <h3 class="rbp-group">Lịch sử đặt lịch</h3>
      <div class="rbp-list">${c.bookings.map((b) => `<article class="rbp-card rbp-bl-${b.status}" data-open="${b.id}" tabindex="0"><div class="rbp-card-time"><b>${dmy(b.date).slice(0, 5)}</b><small>${b.start}</small></div><div class="rbp-card-main"><div class="rbp-card-top"><b>${esc(b.services.map((s) => s.name).join(' + '))}</b>${badge(b.status)}</div><div class="rbp-card-meta"><span>${ic('user')}${esc(b.staff_name || '—')}</span><span>${ic('cash')}${money(b.total)}</span><span>${ic('tag')}${esc(b.source_label)}</span></div></div></article>`).join('')}</div>`;
  }

  /* =========================================================
   * BÁO CÁO (FR13)
   * ======================================================= */
  function setPreset(p) {
    const t = today(), d = pd(t);
    st.range.preset = p;
    if (p === '7') { st.range.from = addDays(t, -6); st.range.to = t; }
    if (p === '30') { st.range.from = addDays(t, -29); st.range.to = t; }
    if (p === 'month') { st.range.from = ymd(new Date(d.getFullYear(), d.getMonth(), 1)); st.range.to = t; }
    if (p === 'last') { st.range.from = ymd(new Date(d.getFullYear(), d.getMonth() - 1, 1)); st.range.to = ymd(new Date(d.getFullYear(), d.getMonth(), 0)); }
  }
  async function loadReport() {
    st.report = null; renderView();
    const r = await api(`/report?from=${st.range.from}&to=${st.range.to}`);
    st.report = r.ok ? r : { error: r.message };
    renderView();
  }
  function viewReport() {
    const R = st.report, g = st.range;
    const exportUrl = `${B.api}/export?from=${g.from}&to=${g.to}&_wpnonce=${B.nonce}`;
    let h = head('Báo cáo', 'Số liệu vận hành để đánh giá KPI dự án (số khách/ngày, tỉ lệ hoàn thành, doanh thu).', `<a class="rbp-btn rbp-primary" href="${esc(exportUrl)}">${ic('download')}Xuất Excel (CSV)</a>`) +
      `<div class="rbp-row wrap rbp-range"><div class="rbp-chips">${[['7', '7 ngày'], ['30', '30 ngày'], ['month', 'Tháng này'], ['last', 'Tháng trước']].map((p) => `<button class="rbp-chip ${g.preset === p[0] ? 'on' : ''}" data-preset="${p[0]}">${p[1]}</button>`).join('')}</div>
      <label class="rbp-field rbp-inline">Từ<input type="date" value="${g.from}" data-rfrom></label><label class="rbp-field rbp-inline">Đến<input type="date" value="${g.to}" data-rto></label></div>`;
    if (!R) return h + `<div class="rbp-loading">${ic('loader', 'spin')} Đang tính…</div>`;
    if (R.error) return h + empty('alert', 'Không tải được báo cáo', esc(R.error));
    const T = R.totals, days = R.days, n = days.length;
    h += `<div class="rbp-kpis">
      ${kpi('cal', 'Lịch hẹn', T.bookings, (Math.round(10 * (T.bookings - T.cancelled) / Math.max(1, n)) / 10).toString().replace('.', ',') + ' khách/ngày')}
      ${kpi('check', 'Hoàn thành', R.rates.done + '%', T.done + ' lịch')}
      ${kpi('cash', 'Doanh thu', shortMoney(T.revenue), 'từ lịch hoàn thành')}
      ${kpi('users', 'Khách', R.customers.unique, R.customers.new + ' mới · ' + R.customers.returning + ' quay lại')}
      ${kpi('x', 'Hủy', R.rates.cancel + '%', T.cancelled + ' lịch', R.rates.cancel > 20 ? 'warn' : '')}
      ${kpi('userx', 'Vắng mặt', R.rates.no_show + '%', T.no_show + ' lịch', R.rates.no_show > 10 ? 'warn' : '')}
      ${kpi('globe', 'Đặt online', R.rates.online + '%', 'qua website')}
    </div>`;
    const max = Math.max(1, ...days.map((d) => d.bookings));
    const every = n > 20 ? Math.ceil(n / 10) : 1;
    h += `<section class="rbp-panelcard"><h3>Lịch hẹn theo ngày <small>cột đậm = hoàn thành</small></h3>
      <div class="rbp-bars">${days.map((d, i) => `<div class="rbp-bar" title="${dmy(d.date)}: ${d.bookings} lịch, ${d.done} hoàn thành, ${money(d.revenue)}"><span class="all" style="height:${100 * d.bookings / max}%"></span><span class="done" style="height:${100 * d.done / max}%"></span><small>${i % every === 0 ? d.date.slice(8) + '/' + d.date.slice(5, 7) : ''}</small></div>`).join('')}</div></section>`;
    const maxH = Math.max(1, ...R.hours.map((x) => x.count));
    h += `<div class="rbp-two">
      <section class="rbp-panelcard"><h3>Kỹ thuật viên</h3><table class="rbp-table sm"><thead><tr><th>Thợ</th><th>Lịch</th><th>Xong</th><th>Giờ làm</th><th>Doanh thu</th></tr></thead><tbody>
        ${R.staff.map((s) => `<tr><td><b>${esc(s.name)}</b>${s.no_show ? `<small>${s.no_show} khách vắng</small>` : ''}</td><td>${s.bookings}</td><td>${s.done}</td><td>${dur(s.minutes)}</td><td>${money(s.revenue)}</td></tr>`).join('') || '<tr><td colspan="5" class="rbp-muted">Chưa có dữ liệu</td></tr>'}</tbody></table></section>
      <section class="rbp-panelcard"><h3>Dịch vụ được làm nhiều</h3>${R.services.length ? R.services.map((s) => `<div class="rbp-hbar"><span>${esc(s.name)}</span><i style="--w:${100 * s.count / R.services[0].count}%"></i><b>${s.count}</b></div>`).join('') : '<p class="rbp-muted">Chưa có lịch hoàn thành.</p>'}</section>
      <section class="rbp-panelcard"><h3>Giờ cao điểm</h3><div class="rbp-bars sm">${R.hours.map((x) => `<div class="rbp-bar" title="${x.hour}h: ${x.count} lịch"><span class="all" style="height:${100 * x.count / maxH}%"></span><small>${x.hour}h</small></div>`).join('')}</div></section>
      <section class="rbp-panelcard"><h3>Nguồn khách</h3>${R.sources.map((s) => `<div class="rbp-hbar"><span>${esc(s.label)}</span><i style="--w:${100 * s.count / Math.max(1, T.bookings)}%"></i><b>${s.count}</b></div>`).join('') || '<p class="rbp-muted">Chưa có dữ liệu.</p>'}</section>
    </div>`;
    return h;
  }

  /* =========================================================
   * TÀI KHOẢN (chủ tiệm)
   * ======================================================= */
  const ROLES = { ruby_chu_tiem: 'Chủ tiệm', ruby_le_tan: 'Lễ tân', ruby_ktv: 'Kỹ thuật viên' };
  async function loadUsers() {
    st.users = null; renderView();
    const r = await api('/users');
    st.users = r.ok ? r.users : [];
    renderView();
  }
  function viewUsers() {
    let h = head('Tài khoản & phân quyền', 'Mỗi nhân viên một tài khoản. Quyền được giới hạn theo vai trò (FR12, NFR02).', `<button class="rbp-btn rbp-primary" data-new-user>${ic('plus')}Thêm tài khoản</button>`);
    h += `<div class="rbp-roles">
      <div><b>${ic('crown')}Chủ tiệm</b><p>Toàn quyền: lịch hẹn, khách hàng, báo cáo & xuất file, tài khoản, dịch vụ & cài đặt.</p></div>
      <div><b>${ic('desk')}Lễ tân</b><p>Xác nhận / hủy, gán & đổi thợ, đổi giờ, tạo lịch cho khách gọi điện, xem khách hàng. Không xem báo cáo.</p></div>
      <div><b>${ic('brush')}Kỹ thuật viên</b><p>Chỉ xem lịch của chính mình (SĐT khách được ẩn bớt), bấm Bắt đầu / Hoàn thành.</p></div></div>`;
    if (st.userForm) h += userForm();
    if (!st.users) return h + `<div class="rbp-loading">${ic('loader', 'spin')} Đang tải…</div>`;
    return h + `<div class="rbp-table-wrap"><table class="rbp-table"><thead><tr><th>Nhân viên</th><th>Đăng nhập</th><th>Vai trò</th><th>Gắn với thợ</th><th></th></tr></thead><tbody>
      ${st.users.map((u) => u.role === 'administrator' || u.self ? `<tr><td><b>${esc(u.name)}</b><small>${esc(u.email)}</small></td><td>${esc(u.login)}</td><td><span class="rbp-role">${esc(u.roleLabel)}</span></td><td>—</td><td class="rbp-muted">${u.self ? 'Bạn' : ''}</td></tr>` :
        `<tr data-user="${u.id}"><td><b>${esc(u.name)}</b><small>${esc(u.email)}</small></td><td>${esc(u.login)}</td>
        <td><select data-urole aria-label="Vai trò">${Object.keys(ROLES).map((k) => `<option value="${k}" ${u.role === k ? 'selected' : ''}>${ROLES[k]}</option>`).join('')}<option value="none">— Thu hồi quyền —</option></select></td>
        <td><select data-ustaff aria-label="Thợ" ${u.role === 'ruby_ktv' ? '' : 'disabled'}><option value="0">—</option>${B.staff.map((s) => `<option value="${s.id}" ${u.staff_id === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></td>
        <td><button class="rbp-btn rbp-ghost rbp-sm" data-save-user="${u.id}">Lưu</button></td></tr>`).join('')}
    </tbody></table></div>`;
  }
  function userForm() {
    return `<section class="rbp-panelcard rbp-userform"><h3>Thêm tài khoản nhân viên</h3>
      <div class="rbp-grid3">
        <label class="rbp-field">Họ tên<input data-nu="name" placeholder="VD: Nguyễn Thu Hà"></label>
        <label class="rbp-field">Tên đăng nhập<input data-nu="login" placeholder="VD: thuha (không dấu)" autocomplete="off"></label>
        <label class="rbp-field">Email<input type="email" data-nu="email" placeholder="thuha@gmail.com"></label>
        <label class="rbp-field">Mật khẩu (≥ 8 ký tự)<input type="text" data-nu="password" value="${esc(genPass())}" autocomplete="new-password"></label>
        <label class="rbp-field">Vai trò<select data-nu="role">${Object.keys(ROLES).map((k) => `<option value="${k}" ${k === 'ruby_ktv' ? 'selected' : ''}>${ROLES[k]}</option>`).join('')}</select></label>
        <label class="rbp-field">Là kỹ thuật viên nào<select data-nu="staff_id"><option value="0">—</option>${B.staff.map((s) => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></label>
      </div>
      <p class="rbp-muted">Gửi tên đăng nhập + mật khẩu cho nhân viên. Trang đăng nhập: <b>${esc(location.origin + location.pathname)}</b></p>
      <div class="rbp-row"><button class="rbp-btn rbp-ghost" data-cancel-user>Thôi</button><button class="rbp-btn rbp-primary" data-create-user>${ic('check')}Tạo tài khoản</button></div></section>`;
  }
  function genPass() { const c = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789'; let p = 'Ruby'; const a = new Uint32Array(6); crypto.getRandomValues(a); a.forEach((x) => { p += c[x % c.length]; }); return p + '@' + (a[0] % 90 + 10); }

  /* =========================================================
   * DỊCH VỤ & GIÁ · KỸ THUẬT VIÊN · CÀI ĐẶT (FR17) – chủ tiệm
   * ======================================================= */
  async function loadCatalog() {
    if (!st.catalog) { renderView(); }
    const r = await api('/catalog');
    if (r.ok) applyCatalog(r);
    renderView();
  }
  function applyCatalog(r) {
    st.catalog = r;
    B.services = r.services; B.staff = r.staff;
    Object.assign(S, { open: r.settings.open_time, close: r.settings.close_time, step: +r.settings.slot_step });
  }
  const catOpts = (v) => Object.keys(CATS).map((k) => `<option value="${k}" ${v === k ? 'selected' : ''}>${CATS[k]}</option>`).join('');

  function viewServices() {
    const C = st.catalog;
    let h = head('Dịch vụ & giá', 'Bảng dịch vụ dùng cho trang đặt lịch và AI tư vấn (FR17). Đổi ở đây là khách thấy ngay.', `<button class="rbp-btn rbp-primary" data-ed-new="service">${ic('plus')}Thêm dịch vụ</button>`);
    if (!C) return h + `<div class="rbp-loading">${ic('loader', 'spin')} Đang tải…</div>`;
    const f = st.svcFilter || 'all', q = (st.svcQ || '').toLowerCase();
    const list = C.services.filter((x) => (f === 'all' || x.category === f) && (!q || x.name.toLowerCase().indexOf(q) > -1))
      .sort((a, b) => (b.active - a.active) || (a.sort_order - b.sort_order) || (a.id - b.id)); // hidden services go to the bottom
    const hiddenN = list.filter((x) => !x.active).length;
    h += `<div class="rbp-row wrap" style="margin-bottom:14px"><div class="rbp-chips">${['all', 'nail', 'mi', 'combo'].map((c) => `<button class="rbp-chip ${f === c ? 'on' : ''}" data-svcf="${c}">${c === 'all' ? 'Tất cả' : CATS[c]} <small>${c === 'all' ? C.services.length : C.services.filter((x) => x.category === c).length}</small></button>`).join('')}</div>
      <label class="rbp-search">${ic('search')}<input type="search" data-svcq value="${esc(st.svcQ || '')}" placeholder="Tìm dịch vụ"></label></div>`;
    if (!list.length) return h + empty('sparkles', 'Không có dịch vụ', 'Bấm "Thêm dịch vụ" để tạo.');
    if (hiddenN) h += `<p class="rbp-muted" style="margin:-4px 0 10px">${list.length - hiddenN} dịch vụ đang hiển thị cho khách · ${hiddenN} dịch vụ đang ẩn (ở cuối danh sách).</p>`;
    return h + `<div class="rbp-table-wrap"><table class="rbp-table rbp-svctable"><thead><tr><th></th><th>Dịch vụ</th><th>Nhóm</th><th>Thời lượng</th><th>Giá</th><th>Hiển thị</th><th></th></tr></thead><tbody>
      ${list.map((x) => `<tr class="${x.active ? '' : 'rbp-off'}"><td class="rbp-thumbcell">${x.image_thumb ? `<img src="${esc(x.image_thumb)}" alt="">` : `<span>${ic('photo')}</span>`}</td>
        <td><b>${esc(x.name)}</b><small>${esc(x.description || '')}</small></td><td>${CATS[x.category] || x.category}</td><td>${dur(x.duration)}</td><td><b>${money(x.price)}</b></td>
        <td><button class="rbp-switch ${x.active ? 'on' : ''}" data-svc-toggle="${x.id}" aria-label="Hiển thị cho khách" aria-pressed="${!!x.active}"><i></i></button></td>
        <td><button class="rbp-btn rbp-ghost rbp-sm" data-ed-service="${x.id}">${ic('edit')}Sửa</button></td></tr>`).join('')}
    </tbody></table></div>`;
  }

  function viewStaff() {
    const C = st.catalog;
    let h = head('Kỹ thuật viên', 'Thợ nhận lịch, dịch vụ mỗi người làm được và tài khoản đăng nhập của họ.', `<button class="rbp-btn rbp-primary" data-ed-new="staff">${ic('plus')}Thêm kỹ thuật viên</button>`);
    if (!C) return h + `<div class="rbp-loading">${ic('loader', 'spin')} Đang tải…</div>`;
    if (!C.staff.length) return h + empty('brush', 'Chưa có kỹ thuật viên', '');
    return h + `<div class="rbp-staffgrid">${C.staff.map((x) => `<article class="rbp-staffcard ${x.active ? '' : 'rbp-off'}">
      <div class="rbp-staffphoto">${x.image ? `<img src="${esc(x.image)}" alt="">` : `<span>${esc(x.name.split(' ').pop()[0])}</span>`}${x.active ? '' : '<em>Tạm nghỉ</em>'}</div>
      <div class="rbp-staffbody"><b>${esc(x.name)}</b><small>${esc(x.title || '')}</small>
        <p>${ic('sparkles')}${x.service_ids.length ? x.service_ids.length + ' dịch vụ' : 'Làm được tất cả dịch vụ'}</p>
        <p>${ic('usercircle')}${x.user_name ? esc(x.user_name) : '<span class="rbp-muted">Chưa có tài khoản đăng nhập</span>'}</p>
        <button class="rbp-btn rbp-ghost rbp-sm" data-ed-staff="${x.id}">${ic('edit')}Sửa</button></div></article>`).join('')}</div>
      <p class="rbp-muted" style="margin-top:12px">Để thợ tự xem lịch của mình: vào <a href="#/tai-khoan">Tài khoản nhân viên</a>, tạo tài khoản vai trò Kỹ thuật viên và gắn với thợ tương ứng.</p>`;
  }

  function viewSettings() {
    const C = st.catalog;
    let h = head('Cài đặt đặt lịch', 'Giờ mở cửa, quy tắc nhận lịch và thông tin liên hệ (dùng cho trang đặt lịch, email và FR09).');
    if (!C) return h + `<div class="rbp-loading">${ic('loader', 'spin')} Đang tải…</div>`;
    const x = C.settings, days = [1, 2, 3, 4, 5, 6, 0], dn = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const num = (k, label, min, max, step, hint) => `<label class="rbp-field">${label}${hint ? ` <small>${hint}</small>` : ''}<input type="number" data-set="${k}" value="${esc(x[k])}" min="${min}" max="${max}" step="${step || 1}"></label>`;
    const txt = (k, label, type, ph) => `<label class="rbp-field">${label}<input type="${type || 'text'}" data-set="${k}" value="${esc(x[k] || '')}" placeholder="${esc(ph || '')}"></label>`;
    return h + `<div class="rbp-form">
      <section class="rbp-fsec"><h3>${ic('clock')}Giờ làm việc</h3>
        <div class="rbp-grid3"><label class="rbp-field">Mở cửa<input type="time" data-set="open_time" value="${esc(x.open_time)}"></label><label class="rbp-field">Đóng cửa<input type="time" data-set="close_time" value="${esc(x.close_time)}"></label>${num('slot_step', 'Khung giờ cách nhau', 10, 120, 5, '(phút)')}</div>
        <div class="rbp-field">Ngày mở cửa<div class="rbp-chips">${days.map((d) => `<button class="rbp-chip ${x.open_days.map(Number).indexOf(d) > -1 ? 'on' : ''}" data-openday="${d}">${dn[d]}</button>`).join('')}</div></div></section>
      <section class="rbp-fsec"><h3>${ic('cal')}Quy tắc nhận lịch</h3>
        <div class="rbp-grid3">${num('days_ahead', 'Cho đặt trước tối đa', 1, 60, 1, '(ngày)')}${num('min_lead', 'Phải đặt trước ít nhất', 0, 1440, 15, '(phút)')}${num('cancel_before', 'Khách tự hủy trước giờ hẹn', 0, 72, 1, '(giờ)')}</div>
        <label class="rbp-check"><input type="checkbox" data-set="auto_confirm" ${+x.auto_confirm ? 'checked' : ''}> Tự động xác nhận lịch khách đặt qua web (không cần lễ tân duyệt)</label></section>
      <section class="rbp-fsec"><h3>${ic('photo')}Ảnh mẫu khách gửi</h3>
        <div class="rbp-grid3">${num('max_images', 'Số ảnh tối đa', 0, 10)}${num('max_image_mb', 'Dung lượng mỗi ảnh', 1, 20, 1, '(MB)')}</div></section>
      <section class="rbp-fsec"><h3>${ic('phone')}Thông tin tiệm & liên kết</h3>
        <div class="rbp-grid3">${txt('shop_phone', 'Số điện thoại tiệm')}${txt('shop_address', 'Địa chỉ')}${txt('admin_email', 'Email nhận thông báo lịch mới', 'email')}</div>
        <div class="rbp-grid2">${txt('policy_url', 'Link trang Chính sách hủy/đổi lịch', 'url', 'https://…')}${txt('status_url', 'Link trang Tra cứu lịch hẹn', 'url', 'https://…')}</div></section>
      ${loaSection()}
      <div class="rbp-formbar"><div><small>Thay đổi áp dụng ngay cho trang đặt lịch</small></div><button class="rbp-btn rbp-primary" data-save-settings>${ic('check')}Lưu cài đặt</button></div>
    </div>`;
  }

  /* ---------------- chatbot settings (FR10, FR11, FR17) ---------------- */
  async function loadChat() {
    const r = await api('/chat-settings');
    if (!r.ok) { st.chat = null; view().innerHTML = head('Chatbot tư vấn') + `<p class="warn">${esc(r.message || 'Không tải được cài đặt.')}</p>`; return; }
    st.chat = r.settings; renderView();
  }
  const PROVIDERS = [['none', 'Không dùng AI – trả lời theo mẫu (miễn phí)'], ['gemini', 'Google Gemini (có gói miễn phí)'], ['claude', 'Anthropic Claude'], ['openai', 'OpenAI (ChatGPT)']];
  function viewChat() {
    const x = st.chat;
    let h = head('Chatbot tư vấn', 'Trợ lý trong khung chat góc phải website: trả lời khách theo bảng dịch vụ & giá chính thức (FR10), câu ngoài phạm vi thì mời liên hệ nhân viên (FR11).');
    if (!x) return h + `<div class="rbp-loading">${ic('loader', 'spin')} Đang tải…</div>`;
    const T = st.chatTry || {};
    const ai = x.ai_provider !== 'none';
    const inp = (k, label, ph, type) => `<label class="rbp-field">${label}<input type="${type || 'text'}" data-chat="${k}" value="${esc(x[k] == null ? '' : x[k])}" placeholder="${esc(ph || '')}"></label>`;
    return h + `<div class="rbp-form">
      <section class="rbp-fsec"><h3>${ic('message')}Khung chat</h3>
        <label class="rbp-check"><input type="checkbox" data-chat="enabled" ${+x.enabled ? 'checked' : ''}> Hiện nút chat ở góc phải mọi trang của website</label>
        <div class="rbp-grid2">${inp('bot_name', 'Tên trợ lý', 'Ruby')}${inp('title', 'Tên hiển thị trên khung chat', 'Ruby Nails & Eyelash')}</div>
        <label class="rbp-field">Lời chào đầu tiên<textarea class="rbp-textarea" data-chat="greeting" rows="2">${esc(x.greeting)}</textarea></label>
        <label class="rbp-field">Câu hỏi gợi ý <small>(mỗi dòng một câu, tối đa 8)</small><textarea class="rbp-textarea" data-chat="suggestions" rows="5">${esc(x.suggestions)}</textarea></label>
        <label class="rbp-check"><input type="checkbox" data-chat="voice" ${+x.voice ? 'checked' : ''}> Cho khách hỏi bằng giọng nói (nút micro) và nghe đọc câu trả lời</label>
        <div class="rbp-grid2"><label class="rbp-field">Giọng đọc câu trả lời<select data-chat="tts"><option value="auto" ${x.tts === 'auto' ? 'selected' : ''}>Giọng nữ AI của Google (cần khóa Gemini)</option><option value="device" ${x.tts === 'device' ? 'selected' : ''}>Giọng có sẵn trên máy của khách</option></select></label>
        <label class="rbp-field">Chọn giọng nữ<select data-chat="tts_voice">${Object.keys(x.tts_voices || {}).map((k) => `<option value="${esc(k)}" ${x.tts_voice === k ? 'selected' : ''}>${esc(x.tts_voices[k])}</option>`).join('')}</select></label></div>
        <p class="rbp-muted rbp-sm-p">${+x.tts_on ? 'Đang dùng giọng nữ AI của Google cho mọi khách (giống nhau trên mọi máy).' : 'Đang dùng giọng có sẵn trên máy khách: ưu tiên giọng nữ; nếu máy chỉ có giọng nam thì hệ thống nâng tông cho nhẹ hơn. Bật Gemini ở mục AI bên dưới để có giọng nữ tự nhiên.'}</p>
      </section>
      <section class="rbp-fsec"><h3>${ic('phone')}Nút liên hệ trong khung chat</h3>
        <div class="rbp-grid2">${inp('zalo', 'Số Zalo', 'Để trống = dùng số điện thoại tiệm', 'tel')}${inp('messenger', 'Trang Facebook (Messenger)', 'VD: rubynails.danang hoặc link m.me/…')}</div>
        <p class="rbp-muted rbp-sm-p">Nút Gọi điện luôn dùng số điện thoại tiệm ở mục Cài đặt. Để trống Messenger thì ẩn nút này.</p>
      </section>
      <section class="rbp-fsec"><h3>${ic('sparkles')}Trả lời bằng AI</h3>
        <p class="rbp-muted rbp-sm-p">Không có AI, chatbot vẫn trả lời giá, thời gian làm, giờ mở cửa, địa chỉ, cách đặt/hủy lịch theo mẫu. Bật AI để chatbot hiểu câu hỏi tự do (VD: "đi đám cưới nên làm gì?") – AI <b>chỉ được dùng</b> bảng dịch vụ, cài đặt tiệm và phần thông tin thêm bên dưới.</p>
        <div class="rbp-grid2"><label class="rbp-field">Nhà cung cấp<select data-chat="ai_provider">${PROVIDERS.map((p) => `<option value="${p[0]}" ${x.ai_provider === p[0] ? 'selected' : ''}>${p[1]}</option>`).join('')}</select></label>
        <label class="rbp-field">Khóa API ${x.ai_key_hint ? `<small>(đã lưu ${esc(x.ai_key_hint)})</small>` : ''}<input type="password" data-chat="ai_key" value="" autocomplete="off" placeholder="${x.ai_key_hint ? 'Để trống = giữ khóa cũ' : 'Dán khóa API vào đây'}"></label></div>
        <div class="rbp-grid2">${inp('ai_model', 'Model', x.ai_model_default || 'Mặc định')}${inp('ai_daily', 'Giới hạn lượt AI mỗi ngày', '300', 'number')}</div>
        ${x.ai_key_hint ? `<label class="rbp-check"><input type="checkbox" data-chat="ai_key_clear"> Xóa khóa API đã lưu</label>` : ''}
        <div class="rbp-loa-grid">
          <div class="rbp-loa-row"><span>Trạng thái</span>${ai && x.ai_key_hint ? '<b class="rbp-okc">AI đang bật</b>' : ai ? '<b class="rbp-warnc">Chưa có khóa API – đang trả lời theo mẫu</b>' : '<b class="rbp-off">Trả lời theo mẫu</b>'}</div>
          <div class="rbp-loa-row"><span>Lượt AI hôm nay</span><b>${+x.ai_used_today} / ${+x.ai_daily || 'không giới hạn'}</b></div>
          ${x.ai_last_error ? `<div class="rbp-loa-row"><span>Lỗi gần nhất</span><b class="rbp-warnc">${esc(x.ai_last_error)}</b></div>` : ''}
        </div>
        <div class="rbp-row rbp-wrap"><button class="rbp-btn rbp-ghost" data-chat-test>${ic('play')}Lưu & kiểm tra kết nối AI</button></div>
        ${T.test ? `<p class="${T.test.ok ? 'rbp-okc' : 'warn'}">${T.test.ok ? 'Kết nối thành công (' + T.test.ms + ' ms). AI trả lời thử: ' : ''}${esc(T.test.ok ? T.test.reply : T.test.message)}</p>` : ''}
        ${T.test && T.test.tts ? (T.test.tts.ok ? `<div class="rbp-loa-row"><span>Giọng nữ AI</span><audio controls autoplay src="${esc(T.test.tts.url)}"></audio></div>` : `<p class="warn">Giọng đọc AI chưa dùng được: ${esc(T.test.tts.message)} – khung chat sẽ dùng giọng có sẵn trên máy khách.</p>`) : ''}
        <details class="rbp-tips"><summary>${ic('alert')}Cách lấy khóa API & lưu ý chi phí</summary><ul>
          <li><b>Google Gemini:</b> vào aistudio.google.com → đăng nhập Google → "Get API key" → "Create API key", dán vào ô trên. Gói miễn phí đủ cho tiệm nhỏ nhưng Google có thể dùng nội dung chat để cải thiện sản phẩm.</li>
          <li><b>Claude</b> (console.anthropic.com) và <b>OpenAI</b> (platform.openai.com) tính phí theo lượt dùng, cần nạp tiền trước.</li>
          <li>Khóa API được lưu trên máy chủ, không bao giờ gửi xuống trình duyệt của khách. Giới hạn lượt/ngày giúp không bị tốn phí bất ngờ; hết lượt chatbot tự quay về trả lời theo mẫu.</li>
          <li>Nếu AI lỗi (sai khóa, hết hạn mức, mất mạng), khách vẫn được trả lời theo mẫu – không bao giờ bị bỏ lửng.</li></ul></details>
      </section>
      <section class="rbp-fsec"><h3>${ic('note')}Thông tin thêm cho chatbot</h3>
        <p class="rbp-muted rbp-sm-p">Chỉ ghi thông tin chính thức của tiệm mà bảng dịch vụ chưa có: khuyến mãi đang chạy, bảo hành, chỗ gửi xe, lưu ý trước khi nối mi… Chatbot (AI) sẽ dựa vào đây để trả lời.</p>
        <textarea class="rbp-textarea" data-chat="extra" rows="6" placeholder="VD: Bảo hành sơn gel 5 ngày nếu bong tróc. Có chỗ gửi xe máy trước tiệm.">${esc(x.extra)}</textarea>
      </section>
      <section class="rbp-fsec"><h3>${ic('search')}Thử chatbot</h3>
        <div class="rbp-row rbp-wrap"><input class="rbp-input" data-chat-q placeholder="Nhập câu hỏi như khách, VD: nối mi bao nhiêu tiền?" value="${esc(T.q || '')}" style="flex:1;min-width:220px"><button class="rbp-btn rbp-primary" data-chat-try>${ic('message')}Hỏi thử</button></div>
        ${T.busy ? `<p class="rbp-muted">${ic('loader', 'spin')} Đang trả lời…</p>` : ''}
        ${T.res ? `<div class="rbp-loa-row" style="display:block"><small class="rbp-muted">Nguồn: ${T.res.source === 'ai' ? 'AI' : 'trả lời theo mẫu'}</small><div style="white-space:pre-line;margin-top:4px">${esc(T.res.reply || T.res.message || '')}</div></div>` : ''}
      </section>
      <div class="rbp-formbar"><div><small>Lưu xong, tải lại trang web để thấy thay đổi trong khung chat</small></div><button class="rbp-btn rbp-primary" data-chat-save>${ic('check')}Lưu cài đặt chatbot</button></div>
    </div>`;
  }
  async function saveChat() {
    const body = {};
    document.querySelectorAll('[data-chat]').forEach((i) => { body[i.dataset.chat] = i.type === 'checkbox' ? (i.checked ? 1 : 0) : i.value; });
    const r = await api('/chat-settings', { method: 'POST', body });
    if (!r.ok) { toast(r.message || 'Không lưu được', 'err'); return false; }
    st.chat = r.settings; return true;
  }

  function loaSection() {
    const s = sndState(), R = st.rec || {};
    const status = !s.on ? '<b class="rbp-off">Đang tắt</b>' : s.unlocked ? '<b class="rbp-okc">Đang bật</b>' : '<b class="rbp-warnc">Chờ chạm vào trang</b>';
    return `<section class="rbp-fsec" id="rbp-loa"><h3>${ic('speaker')}Loa thông báo lịch mới</h3>
      <p class="rbp-muted rbp-sm-p">Khách vừa đặt lịch qua web (chậm nhất ~5 giây) → máy kêu "ting ting", phát câu ghi âm của tiệm và đọc tên khách, dịch vụ, giờ hẹn. Hoạt động trên <b>mọi trang</b> của website khi nhân viên đăng nhập.</p>
      <div class="rbp-loa-grid">
        <div class="rbp-loa-row"><span>Loa trên máy này</span>${status}</div>
        <div class="rbp-loa-row"><span>Giọng đọc tiếng Việt</span>${s.voice ? '<b class="rbp-okc">' + esc(s.voice) + '</b>' : '<b class="rbp-warnc">Máy chưa có – nên ghi âm câu thông báo bên dưới</b>'}</div>
        <div class="rbp-loa-row"><span>Câu thông báo ghi âm</span>${B.notifyAudio ? '<audio controls preload="none" src="' + esc(B.notifyAudio) + '"></audio>' : '<b class="rbp-off">Chưa có</b>'}</div>
      </div>
      <div class="rbp-row rbp-wrap">
        <button class="rbp-btn ${s.on && s.unlocked ? 'rbp-ghost' : 'rbp-primary'}" data-sound>${ic(s.on ? 'volume' : 'volumeoff')}${s.on && s.unlocked ? 'Tắt loa' : 'Bật loa'}</button>
        <button class="rbp-btn rbp-ghost" data-test-loa>${ic('play')}Thử loa</button>
        ${R.on ? `<button class="rbp-btn rbp-danger-btn" data-rec-stop>${ic('stop')}Dừng ghi (${R.sec || 0}s)</button>` : `<button class="rbp-btn rbp-ghost" data-rec ${R.busy ? 'disabled' : ''}>${ic('mic')}${B.notifyAudio ? 'Ghi âm lại' : 'Ghi âm câu thông báo'}</button>`}
        <label class="rbp-btn rbp-ghost">${ic('fileup')}Tải file âm thanh<input type="file" accept="audio/*,.mp3,.m4a,.wav,.ogg,.webm" data-loa-file hidden></label>
        ${B.notifyAudio ? `<button class="rbp-btn rbp-ghost" data-loa-del>${ic('trash')}Xóa ghi âm</button>` : ''}
      </div>
      ${R.busy ? `<p class="rbp-muted">${ic('loader', 'spin')} Đang lưu…</p>` : ''}
      ${R.err ? `<p class="warn">${esc(R.err)}</p>` : ''}
      <details class="rbp-tips"><summary>${ic('bluetooth')}Mẹo dùng với loa Bluetooth</summary><ul>
        <li>Kết nối loa Bluetooth với máy tính/điện thoại ở quầy và chọn loa đó làm <b>thiết bị phát âm thanh mặc định</b> – thông báo sẽ ra loa.</li>
        <li>Khi loa đang bật, hệ thống phát một tín hiệu cực nhỏ (không nghe thấy) để loa <b>không tự tắt</b> và không bị mất tiếng đầu câu.</li>
        <li>Mở trình duyệt, vào bất kỳ trang nào của web và <b>chạm vào trang 1 lần</b> sau khi mở (trình duyệt bắt buộc). Nút chuông góc trái dưới chuyển sang "Loa đang bật" là được.</li>
        <li>Máy tính Windows: dùng <b>Microsoft Edge</b> sẽ có sẵn giọng đọc tiếng Việt tự nhiên (HoaiMy/NamMinh). Chrome trên Windows thường không có – khi đó hãy ghi âm câu thông báo.</li>
        <li>Đừng tắt hẳn trình duyệt và không để máy ngủ (Sleep) trong giờ mở cửa.</li></ul></details>
    </section>`;
  }
  async function saveLoaAudio(blob, name) {
    st.rec = { busy: true }; refreshSoundButtons();
    const fd = new FormData(); fd.append('file', blob, name);
    let r;
    try { r = await fetch(B.api + '/notify-audio', { method: 'POST', body: fd, headers: { 'X-WP-Nonce': B.nonce }, credentials: 'same-origin' }).then((x) => x.json()); } catch (e) { r = { ok: false, message: 'Tải lên thất bại.' }; }
    st.rec = r.ok ? {} : { err: r.message || 'Lưu thất bại.' };
    if (r.ok) { B.notifyAudio = r.url; if (N) N.setAudio(r.url); toast('Đã lưu câu thông báo. Bấm "Thử loa" để nghe.'); }
    refreshSoundButtons();
  }
  async function startRec() {
    if (!navigator.mediaDevices || !window.MediaRecorder) { st.rec = { err: 'Trình duyệt này không ghi âm được. Hãy ghi bằng điện thoại rồi bấm "Tải file âm thanh".' }; refreshSoundButtons(); return; }
    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (e) { st.rec = { err: 'Chưa cho phép dùng micro. Bấm biểu tượng ổ khóa trên thanh địa chỉ để cho phép.' }; refreshSoundButtons(); return; }
    const type = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm'].find((t) => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) || '';
    const rec = new MediaRecorder(stream, type ? { mimeType: type } : undefined), chunks = [];
    rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    rec.onstop = () => {
      stream.getTracks().forEach((t) => t.stop()); clearInterval(st.rec.timer);
      const mime = rec.mimeType || type || 'audio/webm', blob = new Blob(chunks, { type: mime });
      saveLoaAudio(blob, 'loa.' + (/mp4/.test(mime) ? 'm4a' : 'webm'));
    };
    st.rec = { on: true, sec: 0, rec, timer: setInterval(() => { st.rec.sec++; if (st.rec.sec >= 10) rec.stop(); else { const b = document.querySelector('[data-rec-stop]'); if (b) b.lastChild.textContent = 'Dừng ghi (' + st.rec.sec + 's)'; } }, 1000) };
    rec.start(); refreshSoundButtons();
    toast('Đang ghi âm – nói: "Ruby ơi, có khách đặt lịch mới" rồi bấm Dừng (tối đa 10 giây).');
  }

  /* editor sheet for one service / technician */
  function openEditor(kind, id) {
    const C = st.catalog;
    const blank = kind === 'service'
      ? { id: 0, name: '', category: st.svcFilter && st.svcFilter !== 'all' ? st.svcFilter : 'nail', description: '', price: 0, duration: 60, image_id: 0, image: '', image_thumb: '', detail_url: '', active: 1, sort_order: C.services.length }
      : { id: 0, name: '', title: '', photo_id: 0, photo: '', image: '', service_ids: [], active: 1, sort_order: C.staff.length };
    const src = id ? (kind === 'service' ? C.services : C.staff).find((x) => x.id === id) : blank;
    st.edit = { kind, data: JSON.parse(JSON.stringify(src)), busy: false, err: '', confirmDel: false };
    drawEl().hidden = false; document.body.classList.add('rbp-noscroll');
    renderEditor();
  }
  function renderEditor() {
    const E = st.edit, x = E.data, isSvc = E.kind === 'service';
    const img = isSvc ? (x.image_thumb || x.image) : (x.photo || x.image);
    let body;
    if (isSvc) {
      body = `<div class="rbp-imgpick">${img ? `<img src="${esc(img)}" alt="">` : `<span>${ic('photo')}</span>`}<div><label class="rbp-btn rbp-ghost rbp-sm">${ic('upload')}${img ? 'Đổi ảnh' : 'Tải ảnh lên'}<input type="file" accept="image/jpeg,image/png,image/webp" data-ed-upload hidden></label>${img ? `<button class="rbp-link" data-ed-clearimg>Bỏ ảnh</button>` : ''}<small>Ảnh dọc 3:4 đẹp nhất. Để trống: dùng ảnh trang Dịch vụ.</small></div></div>
        <label class="rbp-field">Tên dịch vụ *<input data-ed="name" value="${esc(x.name)}"></label>
        <div class="rbp-grid3"><label class="rbp-field">Nhóm<select data-ed="category">${catOpts(x.category)}</select></label><label class="rbp-field">Giá (đ) *<input type="number" min="0" step="1000" data-ed="price" value="${x.price}"></label><label class="rbp-field">Thời lượng (phút) *<input type="number" min="10" step="5" data-ed="duration" value="${x.duration}"></label></div>
        <label class="rbp-field">Mô tả ngắn<textarea class="rbp-textarea" rows="3" data-ed="description">${esc(x.description || '')}</textarea></label>
        <label class="rbp-field">Link trang chi tiết <small>(để trống: tự lấy từ trang Dịch vụ)</small><input data-ed="detail_url" value="${esc(x.detail_url || '')}" placeholder="https://…"></label>
        <div class="rbp-grid2"><label class="rbp-field">Thứ tự hiển thị<input type="number" data-ed="sort_order" value="${x.sort_order}"></label><label class="rbp-check rbp-check-mid"><input type="checkbox" data-ed="active" ${x.active ? 'checked' : ''}> Hiển thị cho khách đặt</label></div>`;
    } else {
      const svcs = st.catalog.services;
      body = `<div class="rbp-imgpick round">${img ? `<img src="${esc(img)}" alt="">` : `<span>${ic('user')}</span>`}<div><label class="rbp-btn rbp-ghost rbp-sm">${ic('upload')}${img ? 'Đổi ảnh' : 'Tải ảnh lên'}<input type="file" accept="image/jpeg,image/png,image/webp" data-ed-upload hidden></label>${img ? `<button class="rbp-link" data-ed-clearimg>Bỏ ảnh</button>` : ''}<small>Ảnh hiện trên thẻ chọn thợ của khách.</small></div></div>
        <div class="rbp-grid2"><label class="rbp-field">Tên *<input data-ed="name" value="${esc(x.name)}"></label><label class="rbp-field">Chuyên môn<input data-ed="title" value="${esc(x.title || '')}" placeholder="VD: Chuyên nối mi"></label></div>
        <div class="rbp-field">Dịch vụ làm được <small>(không chọn = làm được tất cả)</small>
          <div class="rbp-row wrap" style="justify-content:flex-start;margin:4px 0 8px"><button class="rbp-link" data-ed-allsvc>Bỏ chọn hết (làm được tất cả)</button></div>
          ${Object.keys(CATS).map((c) => svcs.some((v) => v.category === c) ? `<div class="rbp-svcgroup"><small>${CATS[c]}</small><div class="rbp-chips">${svcs.filter((v) => v.category === c).map((v) => `<button class="rbp-chip ${x.service_ids.indexOf(v.id) > -1 ? 'on' : ''}" data-ed-svc="${v.id}">${esc(v.name)}</button>`).join('')}</div></div>` : '').join('')}</div>
        <div class="rbp-grid2"><label class="rbp-field">Thứ tự hiển thị<input type="number" data-ed="sort_order" value="${x.sort_order}"></label><label class="rbp-check rbp-check-mid"><input type="checkbox" data-ed="active" ${x.active ? 'checked' : ''}> Đang nhận lịch</label></div>
        ${x.user_name ? `<p class="rbp-muted">Tài khoản đăng nhập: <b>${esc(x.user_name)}</b></p>` : ''}`;
    }
    drawEl().innerHTML = `<div class="rbp-scrim" data-close></div><section class="rbp-drawer" role="dialog" aria-label="${isSvc ? 'Dịch vụ' : 'Kỹ thuật viên'}">
      <header class="rbp-dhead"><div><small>${x.id ? 'Sửa' : 'Thêm'} ${isSvc ? 'dịch vụ' : 'kỹ thuật viên'}</small><b>${esc(x.name || (isSvc ? 'Dịch vụ mới' : 'Kỹ thuật viên mới'))}</b></div><button class="rbp-iconbtn" data-close aria-label="Đóng">${ic('x')}</button></header>
      <div class="rbp-dbody rbp-edbody">${body}${E.err ? `<p class="rbp-error">${ic('alert')}${esc(E.err)}</p>` : ''}
        ${E.confirmDel ? `<div class="rbp-panel rbp-danger-panel"><p>Xóa ${isSvc ? 'dịch vụ' : 'kỹ thuật viên'} <b>${esc(x.name)}</b>? Nếu đã có lịch hẹn, hệ thống sẽ ẩn thay vì xóa để giữ đúng lịch sử và báo cáo.</p><div class="rbp-row"><button class="rbp-btn rbp-ghost" data-ed-delno>Thôi</button><button class="rbp-btn rbp-danger" data-ed-delyes>${ic('trash')}Xóa</button></div></div>` : ''}</div>
      <footer class="rbp-dfoot">${x.id ? `<button class="rbp-btn rbp-ghost" data-ed-del>${ic('trash')}Xóa</button>` : ''}<button class="rbp-btn rbp-primary rbp-grow" data-ed-save ${E.busy ? 'disabled' : ''}>${ic('check')}${E.busy ? 'Đang lưu…' : 'Lưu'}</button></footer>
    </section>`;
  }
  async function saveEditor() {
    const E = st.edit, x = E.data, isSvc = E.kind === 'service';
    if ((x.name || '').trim().length < 2) { E.err = 'Nhập tên.'; renderEditor(); return; }
    E.busy = true; E.err = ''; renderEditor();
    const base = isSvc ? '/services' : '/staff';
    const body = isSvc
      ? { name: x.name, category: x.category, price: +x.price, duration: +x.duration, description: x.description, detail_url: x.detail_url, image_id: x.image_id || 0, active: x.active ? 1 : 0, sort_order: +x.sort_order || 0 }
      : { name: x.name, title: x.title, photo_id: x.photo_id || 0, service_ids: x.service_ids, active: x.active ? 1 : 0, sort_order: +x.sort_order || 0 };
    const r = await api(base + (x.id ? '/' + x.id : ''), { method: 'POST', body });
    if (!st.edit) return;
    if (!r.ok) { E.busy = false; E.err = r.message; renderEditor(); return; }
    applyCatalog(r); closeDrawer(); renderView(); toast('Đã lưu ' + x.name);
  }
  async function uploadImage(file) {
    const E = st.edit; if (!E || !file) return;
    if (file.size > 5 * 1048576) { E.err = 'Ảnh tối đa 5MB.'; renderEditor(); return; }
    E.err = ''; E.busy = true; renderEditor();
    const fd = new FormData(); fd.append('file', file);
    let r;
    try { r = await fetch(B.api + '/upload', { method: 'POST', body: fd, headers: { 'X-WP-Nonce': B.nonce }, credentials: 'same-origin' }).then((x) => x.json()); } catch (e) { r = { ok: false, message: 'Tải ảnh thất bại.' }; }
    if (!st.edit) return;
    E.busy = false;
    if (!r.ok) { E.err = r.message || 'Tải ảnh thất bại.'; renderEditor(); return; }
    if (E.kind === 'service') { E.data.image_id = r.id; E.data.image_thumb = r.thumb; E.data.image = r.url; } else { E.data.photo_id = r.id; E.data.photo = r.thumb; E.data.image = r.url; }
    renderEditor();
  }

  /* =========================================================
   * LOA THÔNG BÁO – đọc to khi có khách đặt lịch mới
   * ======================================================= */
  const N = window.RBNotify || null; // assets/notify.js – dùng chung cho mọi trang
  function sndState() { return N ? N.state() : { on: false, unlocked: false, voice: '', clip: false }; }
  function soundButton(cls, iconOnly) {
    const s = sndState();
    const label = !s.on ? 'Bật loa thông báo' : s.unlocked ? 'Loa đang bật' : 'Chạm để bật loa';
    return `<button class="${cls} rbp-sound ${s.on ? (s.unlocked ? 'on' : 'wait') : ''}" data-sound title="${label}" aria-label="${label}">${ic(s.on ? 'volume' : 'volumeoff')}${iconOnly ? '' : `<span>${label}</span>`}</button>`;
  }
  function refreshSoundButtons() {
    document.querySelectorAll('[data-sound]').forEach((b) => { const tmp = document.createElement('div'); tmp.innerHTML = soundButton(b.className.replace(/\s*rbp-sound.*$/, ''), !b.querySelector('span:not(.rbp-i)')); b.replaceWith(tmp.firstElementChild); });
    if (st.view === 'cai-dat') { const box = document.getElementById('rbp-loa'); if (box) box.outerHTML = loaSection(); }
  }
  function toggleSound() {
    if (!N) { toast('Không tải được loa thông báo. Tải lại trang.', 'err'); return; }
    const on = N.toggle();
    const s = sndState();
    if (!on) toast('Đã tắt loa thông báo');
    else toast(s.voice || s.clip ? 'Đã bật loa. Lịch mới sẽ được đọc to trên mọi trang bạn đang mở.' : 'Đã bật loa (tiếng "ting ting"). Máy này chưa có giọng đọc tiếng Việt – vào Cài đặt › Loa thông báo để ghi âm câu thông báo.');
    refreshSoundButtons();
  }
  // Mở trang quản lý → đọc các lịch đang chờ xác nhận (1 lần, ngay khi loa sẵn sàng)
  let readOnce = false;
  function readPendingOnce() {
    if (readOnce || !N || !CAN.manage) return;
    const s = N.state(); if (!s.on || !s.unlocked) return;
    readOnce = true; setTimeout(() => N.readPending(), 600);
  }
  if (N) {
    N.on((type, d) => {
      if (type === 'state') { refreshSoundButtons(); readPendingOnce(); }
      if (type === 'nonce') B.nonce = d;
      if (type === 'feed' && d.pending !== undefined && CAN.manage) setBadge(d.pending);
      if (type === 'new') {
        if (st.view === 'lich' && !st.drawer) loadDay(true);
        if (st.view === 'cho-duyet' && !st.drawer) loadPending();
      }
    });
  }

  /* =========================================================
   * EVENTS
   * ======================================================= */
  app.addEventListener('click', async (e) => {
    const t = e.target.closest('button, a, [data-open], [data-cust], [data-close], [data-more-close]');
    if (!t || !app.contains(t)) return;
    const d = t.dataset;
    if ('sound' in d) { readOnce = true; toggleSound(); return; }
    if (N && CAN.manage && t.matches('a[href$="#/cho-duyet"]')) { readOnce = true; N.readPending(); }
    if ('testLoa' in d) { if (N) { N.test().then(refreshSoundButtons); } return; }
    if ('rec' in d) { startRec(); return; }
    if ('recStop' in d) { if (st.rec && st.rec.rec) st.rec.rec.stop(); return; }
    if ('loaDel' in d) {
      const r = await fetch(B.api + '/notify-audio', { method: 'DELETE', headers: { 'X-WP-Nonce': B.nonce }, credentials: 'same-origin' }).then((x) => x.json()).catch(() => ({ ok: false }));
      if (r.ok) { B.notifyAudio = ''; if (N) N.setAudio(''); toast('Đã xóa câu ghi âm'); } else toast('Không xóa được', 'err');
      refreshSoundButtons(); return;
    }
    if ('more' in d) { const m = document.getElementById('rbp-more'); if (m) m.hidden = false; return; }
    if ('moreClose' in d) { const m = document.getElementById('rbp-more'); if (m) m.hidden = true; if (t.tagName !== 'A') return; }
    // catalog editor
    if (st.edit) {
      const E = st.edit;
      if ('edSave' in d) { saveEditor(); return; }
      if ('edDel' in d) { E.confirmDel = true; renderEditor(); return; }
      if ('edDelno' in d) { E.confirmDel = false; renderEditor(); return; }
      if ('edDelyes' in d) {
        const r = await api((E.kind === 'service' ? '/services/' : '/staff/') + E.data.id + '/delete', { method: 'POST' });
        if (!r.ok) { E.confirmDel = false; E.err = r.message; renderEditor(); return; }
        applyCatalog(r); closeDrawer(); renderView(); toast(r.message || 'Đã xóa ' + E.data.name); return;
      }
      if ('edClearimg' in d) { if (E.kind === 'service') { E.data.image_id = 0; E.data.image_thumb = ''; E.data.image = ''; } else { E.data.photo_id = 0; E.data.photo = ''; E.data.image = ''; } renderEditor(); return; }
      if (d.edSvc) { const id = +d.edSvc, i = E.data.service_ids.indexOf(id); if (i > -1) E.data.service_ids.splice(i, 1); else E.data.service_ids.push(id); t.classList.toggle('on'); return; }
      if ('edAllsvc' in d) { E.data.service_ids = []; renderEditor(); return; }
    }
    if (d.edNew) { openEditor(d.edNew); return; }
    if (d.edService) { openEditor('service', +d.edService); return; }
    if (d.edStaff) { openEditor('staff', +d.edStaff); return; }
    if (d.svcf) { st.svcFilter = d.svcf; renderView(); return; }
    if (d.svcToggle) {
      const x = st.catalog.services.find((v) => v.id === +d.svcToggle);
      const r = await api('/services/' + x.id, { method: 'POST', body: Object.assign({}, x, { active: x.active ? 0 : 1 }) });
      if (!r.ok) { toast(r.message, 'err'); return; }
      applyCatalog(r); renderView(); toast((x.active ? 'Đã ẩn ' : 'Đã hiện ') + x.name); return;
    }
    if (d.openday !== undefined) { t.classList.toggle('on'); return; }
    if ('chatSave' in d) { t.disabled = true; const ok = await saveChat(); t.disabled = false; if (ok) { toast('Đã lưu cài đặt chatbot'); renderView(); } return; }
    if ('chatTest' in d) {
      t.disabled = true; st.chatTry = Object.assign({}, st.chatTry, { test: null });
      if (await saveChat()) { const r = await api('/chat-test', { method: 'POST', body: {} }); st.chatTry.test = r; const s2 = await api('/chat-settings'); if (s2.ok) st.chat = s2.settings; }
      renderView(); return;
    }
    if ('chatTry' in d) {
      const q = (document.querySelector('[data-chat-q]') || {}).value || '';
      if (!q.trim()) return;
      st.chatTry = { q, busy: true }; renderView();
      let r;
      try { r = await fetch(B.api.replace(/\/admin\/?$/, '/chat'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', text: q }] }) }).then((x) => x.json()); } catch (err) { r = { message: 'Mất kết nối.' }; }
      st.chatTry = { q, res: r }; renderView(); return;
    }
    if ('saveSettings' in d) {
      const body = {}; document.querySelectorAll('[data-set]').forEach((i) => { body[i.dataset.set] = i.type === 'checkbox' ? (i.checked ? 1 : 0) : i.value; });
      body.open_days = [...document.querySelectorAll('[data-openday].on')].map((b) => +b.dataset.openday);
      t.disabled = true;
      const r = await api('/settings', { method: 'POST', body });
      t.disabled = false;
      if (!r.ok) { toast(r.message, 'err'); return; }
      applyCatalog(r); toast('Đã lưu cài đặt'); return;
    }
    if ('close' in d && !t.closest('.rbp-cust-stat')) { closeDrawer(); return; }
    if (t.closest('.rbp-cust-stat')) { closeDrawer(); return; }
    if (d.day) { go('#/lich/' + d.day); return; }
    if (d.mode) { st.mode = d.mode; try { localStorage.setItem('rbp_mode', d.mode); } catch (err) {} renderView(); return; }
    if ('toggleCancelled' in d) { st.showCancelled = !st.showCancelled; renderView(); return; }
    if (d.act) {
      e.stopPropagation(); t.disabled = true;
      const ok = await act(+d.id, d.act);
      if (!ok) t.disabled = false;
      return;
    }
    if (e.target.closest('[data-stop]')) return;
    if (d.open) { openDrawer(+d.open); return; }
    // drawer
    if (d.panel !== undefined && st.drawer) { st.drawer.panel = d.panel; st.drawer.slots = null; st.drawer.rsTime = null; renderDrawer(); return; }
    if (d.assignTo && st.drawer) {
      const r = await api('/booking/' + st.drawer.id + '/assign', { method: 'POST', body: { staff_id: +d.assignTo } });
      if (!r.ok) { toast(r.message, 'err'); return; }
      toast('Đã giao cho ' + r.booking.staff_name); afterChange(r.booking); return;
    }
    if (d.reason) { const ta = document.querySelector('[data-cancel-reason]'); if (ta) ta.value = d.reason; return; }
    if ('confirmCancel' in d && st.drawer) {
      const reason = (document.querySelector('[data-cancel-reason]') || {}).value || '';
      if (!reason.trim()) { toast('Vui lòng nhập lý do hủy.', 'err'); return; }
      t.disabled = true; if (!(await act(st.drawer.id, 'cancelled', reason))) t.disabled = false; return;
    }
    if (d.rsTime && st.drawer) { st.drawer.rsTime = d.rsTime; renderDrawer(); return; }
    if ('doReschedule' in d && st.drawer) {
      const staff = +((document.querySelector('[data-rs-staff]') || {}).value || 0);
      t.disabled = true;
      const r = await api('/booking/' + st.drawer.id + '/reschedule', { method: 'POST', body: { date: st.drawer.rsDate, time: st.drawer.rsTime, staff_id: staff } });
      if (!r.ok) { toast(r.message, 'err'); t.disabled = false; return; }
      toast('Đã đổi sang ' + r.booking.start + ' ' + dmy(r.booking.date)); afterChange(r.booking); return;
    }
    if ('saveNote' in d && st.drawer) {
      const r = await api('/booking/' + st.drawer.id + '/note', { method: 'POST', body: { admin_note: document.querySelector('[data-note]').value } });
      toast(r.ok ? 'Đã lưu ghi chú' : r.message, r.ok ? '' : 'err'); if (r.ok) afterChange(r.booking); return;
    }
    // form
    const f = st.form;
    if (d.src && f) { f.source = d.src; renderView(); return; }
    if (d.fcat && f) { f.cat = d.fcat; renderView(); return; }
    if (d.fsvc && f) { const id = +d.fsvc, i = f.services.indexOf(id); if (i > -1) f.services.splice(i, 1); else f.services.push(id); loadFormSlots(); return; }
    if (d.fdate && f) { f.date = d.fdate; f.time = ''; loadFormSlots(); return; }
    if (d.ftime && f) { f.time = d.ftime; f.staff = 0; renderView(); return; }
    if (d.fstaff !== undefined && f) { f.staff = +d.fstaff; renderView(); return; }
    if ('resetForm' in d) { newForm(); renderView(); return; }
    if ('submitForm' in d) { submitForm(); return; }
    if (d.bookFor) { const c = st.customer.data; newForm({ phone: c.phone, name: c.name, email: c.email, known: c }); go('#/tao-lich'); return; }
    // customers
    if (d.cust) { go('#/khach-hang/' + encodeURIComponent(d.cust)); return; }
    // report
    if (d.preset) { setPreset(d.preset); loadReport(); return; }
    // users
    if ('newUser' in d) { st.userForm = true; renderView(); return; }
    if ('cancelUser' in d) { st.userForm = false; renderView(); return; }
    if ('createUser' in d) {
      const body = {}; document.querySelectorAll('[data-nu]').forEach((i) => { body[i.dataset.nu] = i.value; });
      t.disabled = true;
      const r = await api('/users', { method: 'POST', body });
      t.disabled = false;
      if (!r.ok) { toast(r.message, 'err'); return; }
      st.users = r.users; st.userForm = false; renderView(); toast('Đã tạo tài khoản ' + body.login); return;
    }
    if (d.saveUser) {
      const row = t.closest('tr');
      const r = await api('/users/' + d.saveUser, { method: 'POST', body: { role: row.querySelector('[data-urole]').value, staff_id: +row.querySelector('[data-ustaff]').value } });
      if (!r.ok) { toast(r.message, 'err'); return; }
      st.users = r.users; renderView(); toast('Đã cập nhật quyền'); return;
    }
  });

  app.addEventListener('change', async (e) => {
    const t = e.target, d = t.dataset;
    if ('edUpload' in d) { uploadImage(t.files[0]); return; }
    if ('loaFile' in d) { const f = t.files[0]; if (f) { if (f.size > 3 * 1048576) { st.rec = { err: 'File tối đa 3MB.' }; refreshSoundButtons(); } else saveLoaAudio(f, f.name); } return; }
    if (d.ed && st.edit) { st.edit.data[d.ed] = t.type === 'checkbox' ? (t.checked ? 1 : 0) : t.value; return; }
    if ('pickday' in d && t.value) go('#/lich/' + t.value);
    if (d.assign) {
      const r = await api('/booking/' + d.assign + '/assign', { method: 'POST', body: { staff_id: +t.value } });
      if (!r.ok) { toast(r.message, 'err'); loadPending(); return; }
      toast('Đã giao cho ' + r.booking.staff_name);
      const btn = t.closest('.rbp-assign').querySelector('[data-act]'); if (btn) btn.disabled = false;
      const item = (st.pending || []).find((b) => b.id === r.booking.id); if (item) Object.assign(item, r.booking);
    }
    if ('rsDate' in d && st.drawer && t.value) loadDrawerSlots(t.value);
    if (d.f === 'date' && st.form && t.value) { st.form.date = t.value; st.form.time = ''; loadFormSlots(); }
    if ('rfrom' in d || 'rto' in d) { st.range.preset = ''; st.range[('rfrom' in d) ? 'from' : 'to'] = t.value; loadReport(); }
    if ('urole' in d) { const s = t.closest('tr').querySelector('[data-ustaff]'); s.disabled = t.value !== 'ruby_ktv'; }
    if (d.nu === 'role') { const s = document.querySelector('[data-nu="staff_id"]'); s.disabled = t.value !== 'ruby_ktv'; }
  });

  let qTimer;
  app.addEventListener('input', (e) => {
    const t = e.target, d = t.dataset;
    if (d.ed && st.edit && t.type !== 'checkbox') { st.edit.data[d.ed] = t.value; if (d.ed === 'name') { const b = document.querySelector('.rbp-dhead b'); if (b) b.textContent = t.value || '…'; } return; }
    if ('svcq' in d) { st.svcQ = t.value; clearTimeout(qTimer); qTimer = setTimeout(() => { const pos = t.selectionStart; renderView(); const n = document.querySelector('[data-svcq]'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } }, 200); return; }
    if (d.f && st.form && d.f !== 'date') {
      st.form[d.f] = t.value;
      if (d.f === 'q') { clearTimeout(qTimer); qTimer = setTimeout(() => { const pos = t.selectionStart; renderView(); const n = document.querySelector('[data-f="q"]'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } }, 200); }
      if (d.f === 'phone') { clearTimeout(qTimer); qTimer = setTimeout(lookupPhone, 400); }
    }
    if ('custq' in d) { st.custQ = t.value; clearTimeout(qTimer); qTimer = setTimeout(async () => { const r = await api('/customers?q=' + encodeURIComponent(st.custQ)); st.customers = r.ok ? r.customers : []; const pos = t.selectionStart; renderView(); const n = document.querySelector('[data-custq]'); if (n) { n.focus(); n.setSelectionRange(pos, pos); } }, 300); }
  });

  app.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { if (st.drawer || st.edit) closeDrawer(); const m = document.getElementById('rbp-more'); if (m) m.hidden = true; }
    if (e.key === 'Enter' && e.target.matches('[data-open], [data-cust]')) e.target.click();
  });

  // Live updates: refresh today's schedule every minute so new web bookings appear.
  setInterval(() => {
    if (document.hidden || st.drawer) return;
    if (st.view === 'lich') loadDay(true);
  }, 60000);
  let rTimer;
  window.addEventListener('resize', () => { clearTimeout(rTimer); rTimer = setTimeout(() => { if (st.view === 'lich') renderView(); }, 200); });

  route();
  readPendingOnce();
})();
