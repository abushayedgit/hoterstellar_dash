export const queryKeys = {
  auth: {
    me: ['auth', 'me'],
  },
  admins: {
    all: ['admins'],
    list: (params) => ['admins', 'list', params],
    detail: (id) => ['admins', 'detail', id],
  },
};
