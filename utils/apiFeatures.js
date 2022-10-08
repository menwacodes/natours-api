/*
    Reusable Class
    - query is the mongoose query
        - the query is not run in this class as that would bind it to the tour resource
    - queryString is the query string that comes from Express (from req.query)
 */

class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter(arrExclFields) {
        const filterObj = {...this.queryString};
        arrExclFields.forEach(el => delete filterObj[el]);
        let queryString = JSON.stringify(filterObj);
        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        this.query = this.query.find(JSON.parse(queryString));

        return this;
    }

    sort() {
        this.queryString.sort
            ? this.query.sort(this.queryString.sort.split(',').join(' '))
            : this.query.sort('name');
        return this;
    }

    limitFields() {
        this.queryString.fields
            ? this.query.select(this.queryString.fields.split(',').join(' '))
            : this.query.select('-__v');
        return this;
    }

    paginate() {
        const page = +this.queryString.page || 1;
        const limit = +this.queryString.limit || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);
        // there being no results 'is enough' and an error is not required
        return this;
    }
}

module.exports = APIFeatures;