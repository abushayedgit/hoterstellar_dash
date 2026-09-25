export const queryKeys = {
  auth: { me: ['auth', 'me'] },
  admins: {
    all: ['admins'],
    list: (params) => ['admins', 'list', params],
    detail: (id) => ['admins', 'detail', id],
  },
  categories: {
    all: ['categories'],
    list: (params) => ['categories', 'list', params],
    detail: (id) => ['categories', 'detail', id],
  },
  foods: {
    all: ['foods'],
    list: (params) => ['foods', 'list', params],
    detail: (id) => ['foods', 'detail', id],
  },
};
