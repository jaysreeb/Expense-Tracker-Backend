import express, { Express, Request, response, Response, urlencoded } from "express";
import dotenv from 'dotenv';
import {pool} from './configDB/db'
// Load ENV
dotenv.config();

// Middleware
const app : Express = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// GET-endpoints (DB)
app.get('/api/users',async(req: Request, res: Response) =>{
  const result = await pool.query('SELECT * FROM users');
  res.json(result.rows);
})

app.get('/api/expenses', async(req: Request, res:Response) =>{
    const result = await pool.query('SELECT * FROM expenses');
    res.json(result.rows);
});
app.get('/api/users/:id', async(req: Request, res:Response) =>{
  const {id} = req.params;
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  res.json(result.rows);
});
app.get('/api/expenses/:id', async(req: Request, res: Response) =>{
  const {id} = req.params;
  console.log(req.params);
  const result = await pool.query('SELECT * FROM expenses WHERE id= $1', [id]);
  res.json(result.rows);
});
app.get('/api/expenses/user/:user_id',async(req: Request, res: Response)=>{
  const {user_id} = req.params;
  const result = await pool.query('SELECT * FROM expenses WHERE user_id=$1', [user_id]);
  res.json(result.rows);
})
// DB test Query- POST
app.post('/api/users', async(req: Request, res:Response) => {
  const {email , password, name} = req.body;
  try {
    const result= await pool.query(`INSERT INTO users(email, password, name) VALUES($1, $2, $3) RETURNING *`,
      [email, password, name]
    );
    res.json(result.rows[0]);    
  } catch (error){
    console.log("DB Error", error);
    res.status(500).json({error:'Something is wrong'});
  }
});

app.post('/api/expenses', async(req: Request, res: Response) =>{
  const {user_id, amount,description, date}= req.body;
  try {
    const result = await pool.query(
      `INSERT INTO expenses(user_id, amount, description, date)
      VALUES($1, $2, $3, $4) RETURNING *`,
      [user_id, amount,description, date]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("DB Error:", error);
    res.status(500).json({error: 'Something is broken'});  
  }
});
app.put('/api/users/:id', async(req: Request, res: Response) =>{
  const {id} = req.params;
  const {email, name} = req.body;
  if(!email){
    return res.status(400).json({error:'Email is required!'});
  }
  try {
    const result = await pool.query(`UPDATE users SET name=$1 WHERE id= $2 AND email = $3 RETURNING id,name, email`,
       [name,id, email]);   
    if(result.rowCount === 0){
      return res.status(400).json({error:'User email and name doesnt match'});
    }
    return res.json({
      message: 'Name updated!',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating name', error);
    return res.status(500).json({ error: 'Internal server error' });      
  }
})
app.put('/api/expenses/:id', async(req:Request, res: Response) =>{
  const {id} = req.params;
  const {amount, description, date} = req.body;
  try {
    const result = await pool.query(`UPDATE expenses 
      SET amount = $1, description= $2, date=$3 
      WHERE id= $4
      RETURNING id, amount, description, date`,
      [amount, description, date, id]); 
      return res.json({
      message: "Expense updated!",
      expense: result.rows[0],
    });   
  } catch (error){
    console.error('Error Updating',error);
    return res.status(500).json({eror:'Error Updating expense'});
  }
})
app.delete('/api/users/:id', async(req: Request, res:Response) =>{
  const {id} = req.params;
  try {
    const result =await pool.query('DELETE FROM users WHERE id= $1 RETURNING id',[id]);
    return res.json({
      message:"User deleted",
      user: result.rows[0],
    })
  } catch (error){
    console.error("Error occured during deletion", error);
    return res.status(500).json({error:'Error Deleting user'});
    }
});
app.delete('/api/expenses/:id', async(req: Request, res: Response) =>{
  const {id} = req.params;
  try {
    const result = await pool.query('DELETE FROM expenses WHERE id=$1 RETURNING id',[id]);
    return res.json({
      message:'User Deleted',
      expense:result.rows[0],
    });
  } catch (error) {
    console.log('Deletion Error', error);
    return res.status(500).json({error:'Error deleting expense'});    
  }  
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>{
  console.log(`The App is listening to http://localhost:${PORT}`);
});



