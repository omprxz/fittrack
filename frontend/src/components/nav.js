import { Fragment, useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}


export default function Nav() {
  const auth = localStorage.getItem('user')
  const location = useLocation()
  const navigate = useNavigate();
  const api_baseurl = process.env.REACT_APP_API_URL
  let logIn = {}
  
  if(auth){
   logIn = JSON.parse(localStorage.getItem('user')).logIn
  }
  
  
  
  const [ppPrev, setppPrev] = useState('/user.jpg')
  const [prevPpId, setprevPpId] = useState('/user.jpg')
  const fetchUser = async () => {
    if (logIn._id) {
        const { data: { user } } = await axios.get(`${api_baseurl}/api/user?userId=${logIn._id}`);
        if (user.pp !== prevPpId) {
            setppPrev(user.pp ? `https://lh3.googleusercontent.com/d/${user.pp}=w1000` : '/user.jpg');
            setprevPpId(user.pp);
        }
    }
};

useEffect(() => {
    fetchUser();
}, [logIn]);

useEffect(() => {
    const intervalId = setInterval(() => {
        fetchUser();
    }, 20000);
    return () => clearInterval(intervalId);
}, []);

const navigationItems = [
  { name: 'Home', to: '/', current: location.pathname === '/' },
  auth ? { name: 'Your Logs', to: '/logs', current: location.pathname === '/logs' } : null,
  auth ? { name: 'New Log', to: '/logs/new', current: location.pathname === '/logs/new' } : null,
  auth ? null : { name: 'Signup/Login', to: '/signup', current: location.pathname === '/signup' || location.pathname === '/login' },
  { name: 'About', to: '/about', current: location.pathname === '/about' },
].filter(item => item != null)

  const logOut = () => {
  localStorage.removeItem('user');
  navigate('/login')
  }
 return (
  <Disclosure as="nav" className="bg-gray-900">
    {({ open }) => (
      <>
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
              {/* Mobile menu button*/}
              <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open main menu</span>
                {open ? (
                  <XMarkIcon className="block h-6 w-6 text-gray-100" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6 text-gray-100" aria-hidden="true" />
                )}
              </Disclosure.Button>
            </div>
      
            <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-between">
              <div className="flex flex-shrink-0 items-center">
                <Link to='/'><img
                  className="h-14 w-auto"
                  src="/icon.png"
                  alt="Fit Track"
                />
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:block my-auto">
                <div className="flex space-x-4">
                  {navigationItems.map((item) => (
                    <Link key={item.name} to={item.to} className={classNames(item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white','rounded-md px-3 py-2 text-sm font-medium')} aria-current={item.current ? 'page' : undefined}>
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">

                {/* Profile dropdown */}
                {auth ? (
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                        <span className="absolute -inset-1.5" />
                        <span className="sr-only">Open user menu</span>
                        <img
                          className="h-8 w-8 rounded-full aspect-square object-cover"
                          src={ppPrev}
                          alt=""
                        />
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/profile"
                              className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                            >
                              Your Profile
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/settings"
                              className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                            >
                              Settings
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to=""
                              onClick={logOut}
                              className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700')}
                            >
                              Sign out
                            </Link>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <Link
                    to="/login"
                    className='bg-blue-600 rounded block px-4 py-1.5 text-[15px] text-white'
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
                <Transition
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
          <Disclosure.Panel className="sm:hidden" static>
             {({ close }) => (
          <>
            <div className="space-y-1 px-2 pb-3 pt-2">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.to}
                className={classNames(
                  item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                  'block rounded-md px-3 py-2 text-base font-medium'
                )}
                aria-current={item.current ? 'page' : undefined}
                onClick={() => {
                  close();
                }}
              >
                {item.name}
              </Link>
            ))}
            </div>
          </>
        )}
          </Disclosure.Panel>
          </Transition>
        </div>
      </>
    )}
  </Disclosure>
);
}