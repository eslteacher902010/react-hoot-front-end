// src/components/HootDetails/HootDetails.jsx
import { useParams, Link } from 'react-router-dom'
import { useState, useEffect, useContext } from 'react'
import * as hootService from '../../services/hootService'
import CommentForm from '../CommentForm/CommentForm'
import { UserContext } from '../../contexts/UserContext'
import styles from './HootDetails.module.css'
import Loading from '../Loading/Loading'
import Icon from '../Icon/Icon'
import AuthorInfo from '../../components/AuthorInfo/AuthorInfo'

const HootDetails = ({ handleDeleteHoot }) => {
  const { hootId } = useParams()
  const [hoot, setHoot] = useState(null)
  const [error, setError] = useState(null)
  const { user } = useContext(UserContext)

  const handleAddComment = async (commentFormData) => {
    try {
      const newComment = await hootService.createComment(hootId, commentFormData)
      setHoot((prev) =>
        prev ? { ...prev, comments: [...(prev.comments || []), newComment] } : prev
      )
    } catch (err) {
      console.error('Error adding comment:', err)
      setError('Failed to add comment. Please try again.')
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      await hootService.deleteComment(hootId, commentId)
      setHoot((prev) =>
        prev
          ? {
              ...prev,
              comments: (prev.comments || []).filter((c) => c._id !== commentId),
            }
          : prev
      )
    } catch (err) {
      console.error('Error deleting comment:', err)
      setError('Failed to delete comment. Please try again.')
    }
  }

  useEffect(() => {
    const fetchHoot = async () => {
      try {
        const hootData = await hootService.show(hootId)
        setHoot(hootData)
      } catch (err) {
        console.error('Error fetching hoot:', err)
        setError('Unable to load hoot details. Please refresh the page.')
      }
    }
    fetchHoot()
  }, [hootId])

  if (error) {
    return (
      <main className={styles.container}>
        <p className={styles.error}>{error}</p>
      </main>
    )
  }

  if (!hoot) return <Loading />

  const { category, title, text, comments = [], author } = hoot
  const isOwner = user && author && author._id === user._id

  return (
    <main className={styles.container}>
      <section>
        <header>
          <p>{category?.toUpperCase() || 'UNCATEGORIZED'}</p>
          <h1>{title || 'Untitled Hoot'}</h1>
          <div>
            <AuthorInfo content={hoot} />
            {isOwner && (
              <>
                <Link to={`/hoots/${hootId}/edit`}>
                  <Icon category="Edit" />
                </Link>
                <button
                  type="button"
                  onClick={() => handleDeleteHoot?.(hootId)}
                  aria-label="Delete Hoot"
                >
                  <Icon category="Trash" />
                </button>
              </>
            )}
          </div>
        </header>
        <p>{text || 'No content provided.'}</p>
      </section>

      <section>
        <h2>Comments</h2>
        <CommentForm handleAddComment={handleAddComment} />
        {!comments.length && <p>There are no comments.</p>}
        {comments.map((comment) => {
          const canEdit = user && comment.author && comment.author._id === user._id
          return (
            <article key={comment._id}>
              <header>
                <div>
                  <AuthorInfo content={comment} />
                  {canEdit && (
                    <>
                      <Link to={`/hoots/${hootId}/comments/${comment._id}/edit`}>
                        <Icon category="Edit" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(comment._id)}
                        aria-label="Delete Comment"
                      >
                        <Icon category="Trash" />
                      </button>
                    </>
                  )}
                </div>
              </header>
              <p>{comment.text || '(No text)'}</p>
            </article>
          )
        })}
      </section>
    </main>
  )
}

export default HootDetails
