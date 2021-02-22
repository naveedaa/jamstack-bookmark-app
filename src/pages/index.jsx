import React, { useState } from "react"
import { useMutation, useQuery } from "@apollo/client"
import gql from "graphql-tag"
import BookmarkIcon from '@material-ui/icons/Bookmark';
import { Box, Button, makeStyles, TextField } from "@material-ui/core"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemAvatar from "@material-ui/core/ListItemAvatar"
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction"
import ListItemText from "@material-ui/core/ListItemText"
import Avatar from "@material-ui/core/Avatar"
import DeleteIcon from "@material-ui/icons/Delete"
import Grid from "@material-ui/core/Grid"
import Typography from "@material-ui/core/Typography"
import styles from "./styles.css";

const BookMarksQuery = gql`{
  bookmarks{
    url
    title
    id
  }
}
`
const AddBookmarkMutation = gql`
  mutation addBookmark($url: String!, $title: String!){
    addBookmark(url: $url, title: $title){
      url
    }
  }
`

const deleteBookMark = gql `
  mutation deleteBookmark($id: String!) {
    deleteBookmark(id: $id){
      id
    }
  }
` 

const useStyles = makeStyles(theme => ({
  root: {
    margin: "0 auto",
    textAlign: "center",
    marginTop: "110px",
  },
  title: {
    margin: theme.spacing(4, 0, 2),
  },
  add: {
      textAlign: "center",
      justifyContent: "center",
      marginTop: "72%",
      right: "29vw",
      fontSize: '20px',
      paddingTop: "8%",
      border: "1px solid purple",
      color: "purple"
  }
}))

export default function Home() {
  const { loading, data } = useQuery(BookMarksQuery)
  const [ addBookmark, { loading: adding } ]   = useMutation(AddBookmarkMutation)
  const [ removeBookmark, { loading: deleting } ]   = useMutation(deleteBookMark)

  const [ url, setUrl ]  = useState('')
  const [ title, setTitle ]  = useState('')
  
  const classes = useStyles()

  if(loading){
    return <h1>...loading</h1>
  }

  const addBookmarkSubmit = async () => {
    await addBookmark({
      variables: {
        url, 
        title
      },
      refetchQueries: [{query: BookMarksQuery}]
    })
    setUrl("")
    setTitle("")
  }

  const handleDelete = async (id) => {
    console.log(id)
    await removeBookmark({
      variables: { id },
      refetchQueries: [{query: BookMarksQuery}]
    })
  }
  
  return (   
  <div className={classes.root}>
    <h1 style={{color: 'purple'}}> Bookmark App </h1>
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Box width="55%">
        <TextField
          style={{marginBottom: '20px'}}
          fullWidth
          value={title}
          variant="standard"
          label="Add Title"
          onChange={e => setTitle(e.target.value)}
        />
        <TextField
          fullWidth
          value={url}
          label="Add Url"
          onChange={e => setUrl(e.target.value)}
        />
      </Box>
      <br />
      <div>
      <Button className={classes.add} onClick={addBookmarkSubmit}>Add Bookmark</Button>
      {adding && <p style={{fontWeight : "bold"}}>adding data ...</p>}
      </div>
    </div>
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Grid item xs={12} md={6}>
        <Typography variant="h6" className={classes.title}></Typography>
          <List>
            {data.bookmarks.map(item => {
              return (
                <ListItem key={item.id}>
                  <ListItemAvatar>
                    <Avatar style={{backgroundColor: "white"}}>
                      <BookmarkIcon style={{color: "purple"}}/>
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText> url:<span style={{color: 'purple', borderBottom: '1px solid purple'}}> {item.url} </span> </ListItemText>
                  <ListItemText > title: <span style={{color: 'purple', borderBottom: '1px solid purple'}}>{item.title} </span></ListItemText>
                  <ListItemSecondaryAction   >
                    <Button  variant="outlined" style={{backgroundColor: "white"}}  edge="end" aria-label="delete" onClick={() => {handleDelete(item.id)}} >
                      <DeleteIcon style={{color: 'red'}} />
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              )
            })}
          </List>
          {deleting && <p style={{fontWeight : "bold"}}>removing data ...</p>}
      </Grid>
    </div>
  </div>


  )
}