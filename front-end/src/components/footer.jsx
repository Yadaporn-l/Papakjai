import React from 'react'
import logo from '/public/pa_pak_jai-removebg.png'

export default function Footer() {
    return (
        <>
            <footer className="footer">
                <div className="container f-top">
                    <div className="brandline">
                        <div className="logo">
                            <img src={logo} alt="logo" />
                            <span>PaPak<span className="accent">Jai</span></span>
                        </div>
                        <p>All-in-one travel picks, visa info, and lists for quick trips.</p>
                    </div>
                    <div className="links">
                        <div>
                            <h4>Explore</h4>
                            <a href="#">Destinations</a>
                            <a href="#">Stays</a>
                            <a href="#">Food</a>
                        </div>
                        <div>
                            <h4>Help</h4>
                            <a href="#">Support</a>
                            <a href="#">Safety</a>
                            <a href="#">Cancellations</a>
                        </div>
                        <div>
                            <h4>Company</h4>
                            <a href="#">About</a>
                            <a href="#">Careers</a>
                            <a href="#">Contact</a>
                        </div>
                    </div>
                </div>
                <div className="container f-bottom">
                    <span>© 2025 PaPakJai</span>
                    <div className="socials">
                        <a href="#"><i className="fa-brands fa-facebook"></i></a>
                        <a href="#"><i className="fa-brands fa-x-twitter"></i></a>
                        <a href="#"><i className="fa-brands fa-instagram"></i></a>
                    </div>
                </div>
            </footer>
        </>
    )
}