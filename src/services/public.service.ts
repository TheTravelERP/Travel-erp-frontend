import api from './api';

export const getCountries = async (
  search = "",
  page = 1,
  pageSize = 300
) => {
  const { data } = await api.get(
    "/api/v1/public/countries",
    {
      params: {
        search,
        page,
        page_size: pageSize,
      },
    }
  );

  return data;
};