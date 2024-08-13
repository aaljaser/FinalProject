new Vue({
  el: '#app',
  data() {
    return {
      searchTerm: '',
      searchResults: [],
      isLoading: false,
      errorMessage: ''
    }
  },
  methods: {
    search: _.debounce(function() {
      if (!this.searchTerm) {
        this.searchResults = [];
        return;
      }

      this.isLoading = true;
      this.errorMessage = '';
      
      axios.get(`https://www.googleapis.com/books/v1/volumes?q=` + encodeURIComponent(this.searchTerm))
        .then(response => {
          this.searchResults = response.data.items || [];
        })
        .catch(e => {
          this.errorMessage = 'An error occurred while fetching the data.';
          console.error(e);
        })
        .finally(() => {
          this.isLoading = false;
        });
    }, 300),

    bookAuthors(book) {
      let authors = book.volumeInfo.authors || [];

      if (authors.length < 3) {
        return authors.join(', ');
      } else {
        return authors.slice(0, 2).join(', ') + ' and others';
      }
    }
  }
});
