const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();


const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.e3jxy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('yooda-hostel');
        const tutorsCollection = database.collection('students');
        const ordersCollection = database.collection('foods');
        // const reviewsCollection = database.collection('reviews');
        const usersCollection = database.collection('distribution');

        /* -------tutor------ */
        // GET API
        app.get('/tutors', async (req, res) => {
            const email = req.query.email;
            const status = req.query.status;
            let query = {};
            if (email || status) {
                let myStatus = (status === 'true');
                console.log(email + " " + myStatus);
                if (email) {
                    query = { email: email, status: myStatus };
                } else {
                    query = { status: myStatus };
                }
            }
            const cursor = tutorsCollection.find(query);
            // const page = req.query.page;
            // const size = parseInt(req.query.size);
            let tutors = [];
            const count = await cursor.count();
            tutors = await cursor.toArray();
            // if (page) {
            //     tutors = await cursor.skip(page * size).limit(size).toArray();
            // }
            // else {
            //     tutors = await cursor.toArray();
            // }
            res.send({
                count,
                tutors
            });
        })

        app.get('/tutors/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const tutor = await tutorsCollection.findOne(query);
            res.send(tutor);
        })
        // POST API
        app.post('/tutors', async (req, res) => {
            const newTutor = req.body;
            const result = await tutorsCollection.insertOne(newTutor);
            res.json(result);
        })

        // DELETE ORDER API
        app.delete('/tutors/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await tutorsCollection.deleteOne(query);
            res.json(result);
        })

        // UPDATE ORDER API
        app.put('/tutors/:id', async (req, res) => {
            const id = req.params.id;
            const updateTutor = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upset: true };
            const updateDoc = {
                $set: {
                    status: updateTutor.status
                },
            }
            const result = await tutorsCollection.updateOne(filter, updateDoc, options);
            // console.log(result);
            res.json(result);
        })

        /* -------Order------ */
        // POST ORDER API
        app.post('/orders', async (req, res) => {
            const newOrder = req.body;
            const result = await ordersCollection.insertOne(newOrder);
            res.json(result);
        })

        // GET ORDER API
        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            let query = {};
            if (email) {
                query = { studentEmail: email };
            }
            // console.log(query);
            const cursor = ordersCollection.find(query);
            orders = await cursor.toArray();
            res.send(orders);
        })


        // DELETE ORDER API
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        })

        // UPDATE ORDER API
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const updateOrder = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upset: true };
            const updateDoc = {
                $set: {
                    status: updateOrder.status
                },
            }
            const result = await ordersCollection.updateOne(filter, updateDoc, options);
            // console.log(result);
            res.json(result);
        })

        // /* -------Review------ */
        // // Review get api
        // app.get('/reviews', async (req, res) => {
        //     const cursor = reviewsCollection.find({});
        //     reviews = await cursor.toArray();
        //     res.json(reviews);
        // })

        // // Review post api
        // app.post('/reviews', async (req, res) => {
        //     const newReview = req.body;
        //     const result = await reviewsCollection.insertOne(newReview);
        //     res.json(result);
        // })

        /* -------User------ */
        // GET User API
        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find({});
            users = await cursor.toArray();
            res.send(users);
        })

        // user get api
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            let isTeacher = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            if (user?.role === 'teacher') {
                isTeacher = true;
            }
            res.json({ admin: isAdmin, teacher: isTeacher });
        });

        // user Post Api
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            // console.log(result);
            res.json(result);
        });

        // user Put Api
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // User Admin Put Api
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        // User Teacher Put Api
        app.put('/users/teacher', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'teacher' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })
    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('This is home');
});

app.get('/test', (req, res) => {
    res.send('This is test');
});

app.listen(port, () => {
    console.log('server is up and running at', port);
})