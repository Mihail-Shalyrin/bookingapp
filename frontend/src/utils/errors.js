export function getErrorText(err) {
  const status = err.response?.status;
  const data = err.response?.data;

  if (data?.message) return data.message;
  if (data?.error) return data.error;

  if (status === 401) return "Сессия истекла, войдите снова";
  if (status === 403) return "Недостаточно прав";
  if (status === 404) return "Не найдено";
  if (status === 400) return "Некорректный запрос";

  if (!err.response) return "Сервер недоступен";

  return "Что-то пошло не так";
}