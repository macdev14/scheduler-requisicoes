class UserEntity {
    constructor({
        username,
        password,
        email,
        first_name,
        last_name,
        register_date,
        last_sign_in,
        birthdate,
        document_name,
        active = true,
    }) {
        this.username = username;
        this.password = password;
        this.email = email || null;
        this.first_name = first_name || null;
        this.last_name = last_name || null;
        this.register_date = register_date;
        this.last_sign_in = last_sign_in;
        this.birthdate = birthdate || null;
        this.document_name = document_name || null;
        this.active = active;
    }

    /**
     * Validate the entity properties
     * @returns {boolean}
     */
    validate() {
        if (!this.username || typeof this.username !== "string") {
            throw new Error("Invalid or missing username");
        }

        if (!this.password || typeof this.password !== "string") {
            throw new Error("Invalid or missing password");
        }

        if (!this.register_date || !this.isValidDate(this.register_date)) {
            throw new Error("Invalid or missing register date");
        }

        if (!this.last_sign_in || !this.isValidDate(this.last_sign_in)) {
            throw new Error("Invalid or missing last sign-in date");
        }

        if (this.email && !this.isValidEmail(this.email)) {
            throw new Error("Invalid email format");
        }

        return true;
    }

    /**
     * Validate email format
     * @param {string} email
     * @returns {boolean}
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate date format (YYYY-MM-DD)
     * @param {string} date
     * @returns {boolean}
     */
    isValidDate(date) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        return dateRegex.test(date);
    }

    /**
     * Serialize the entity to persistable format
     * @returns {Object}
     */
    toObject() {
        return {
            username: this.username,
            password: this.password,
            email: this.email,
            first_name: this.first_name,
            last_name: this.last_name,
            register_date: this.register_date,
            last_sign_in: this.last_sign_in,
            birthdate: this.birthdate,
            document_name: this.document_name,
            active: this.active,
        };
    }
}

module.exports = UserEntity;
