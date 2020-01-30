new Vue({
  el: '#app',
  data() {
    return {
      searchTerm: '',
      searchResults: [],
    }
  },//#f3edeb
  methods: {
    search() {
      axios.get(`https://www.googleapis.com/books/v1/volumes?q=` + this.searchTerm)
      .then(response => {
        this.searchResults = response.data
      })
      .catch(e => {
        console.log(e)
      })
    },
    
    bookAuthors(book) {
      let authors = book.volumeInfo.authors;
      
      if (authors.length < 3) {
        authors = authors.join(' and ')
      }
      
      else if (authors.length > 2) {
        let lastAuthor = ' and ' + authors.slice(-1);
        
        authors.pop()
        
        authors = authors.join(', ')

        authors += lastAuthor
      }
      
      return authors
    }
  }
});