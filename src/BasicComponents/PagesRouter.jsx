import React, { Component, Suspense } from "react";
import {  BrowserRouter as Router, Route,  Routes, useParams } from "react-router-dom";
import Loader from "./Loader";
import Share from "../Pages/Share";
import NavBar from "./NavBar";
import { EditorPage, Notes } from "../Pages/Notes";
import Messages from "./Messages";
import {LogIn, SignIn } from "../Pages/Login";

class PagesRouter extends Component {

    constructor(props){
        super(props);
        this.state = {
            tab: "/share"
        }
    }
    

    setTab = (tab) => {
        this.setState({ tab: tab })
    }

    render() {
        const pages = [
            {
                pageLink: '/share/:id?',
                view: Share,
                displayName: 'Share'
            },
            {
                pageLink: '/notes/:id?',
                view: Notes,
                displayName: 'Notes'
            },
            {
                pageLink: '/signup',
                view: SignIn,
                displayName: 'Sign Up'
            },
            {
                pageLink: '/login',
                view: LogIn,
                displayName: 'Log In'
            },
            {
                pageLink: '/addNote/:id?',
                view: EditorPage,
                displayName: 'EditorPage'
            }
        ];

        return (
        <>
            <Messages/>
            <Loader/>
            <Router>
           
                <Suspense fallback={<Loader />}>
                <NavBar/>
                    <Routes>
                        {pages.map((page, index) => (
                            <Route
                                key={index}
                                path={page.pageLink}
                                element={ <page.view />}
                            />
                            ))}
                    </Routes>
                </Suspense>
            </Router>
            </>

        );
    }
}

export default PagesRouter;
